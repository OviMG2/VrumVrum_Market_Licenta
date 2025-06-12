from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Q, F, ExpressionWrapper, fields, Sum, Avg, FloatField
from django.db.models.functions import Abs
from collections import Counter
import logging
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import pandas as pd
from django.utils import timezone
import datetime
from django.utils import timezone
from listings.models import CarListing, Favorite
from listings.serializers import CarListingSerializer
from .models import UserInteraction
from .serializers import UserInteractionSerializer

logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def for_you_recommendations(request):
   
    user = request.user
    algorithm = request.query_params.get('algorithm', 'hybrid')
    
    try:
        
        has_interactions = UserInteraction.objects.filter(user=user).exists()
        has_favorites = Favorite.objects.filter(user=user).exists()
        
     
        if not has_interactions and not has_favorites:
            logger.info(f"Utilizatorul {user.username} nu are interacțiuni. Se returnează anunțuri populare.")
            popular_listings = get_popular_listings(user=user)
            serializer = CarListingSerializer(popular_listings, many=True, context={'request': request})
            return Response(serializer.data)
        
    
        if algorithm == 'collaborative':
            recommendations = collaborative_filtering_recommendations(user)
        elif algorithm == 'content':
            recommendations = content_based_recommendations(user)
        else:  
            recommendations = hybrid_recommendations(user)
        
   
        recommendations = recommendations[:12]
        
        serializer = CarListingSerializer(recommendations, many=True, context={'request': request})
        return Response(serializer.data)
    
    except Exception as e:
        logger.exception(f"Eroare la generarea recomandărilor: {str(e)}")
        return Response(
            {"error": "A apărut o eroare la generarea recomandărilor."},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

def get_popular_listings(limit=12, user=None):
  
   
    popular_listings = CarListing.objects.annotate(
        interaction_count=Count('interactions'),
        favorite_count=Count('favorited_by'),
        popularity_score=Count('interactions') + Count('favorited_by') * 2 
    )
    
  
    if user and user.is_authenticated:
        popular_listings = popular_listings.exclude(user=user)
    
   
    popular_listings = popular_listings.order_by('-popularity_score', '-created_at')[:limit]
    
    return popular_listings

def collaborative_filtering_recommendations(user, limit=24):
  
    logger.info(f"Generarea recomandărilor cu Collaborative Filtering pentru utilizatorul {user.username}")
    
  
    all_interactions = UserInteraction.objects.filter(
        interaction_type__in=['vizualizare', 'favorit', 'contact']
    ).select_related('user', 'car_listing')
    

    if all_interactions.count() < 10:
        logger.info("Nu sunt suficiente interacțiuni pentru collaborative filtering. Folosim content-based.")
        return content_based_recommendations(user, limit)
    
   
    interactions_list = list(all_interactions.values(
        'id', 'user_id', 'car_listing_id', 'interaction_type', 'interaction_count', 'last_interaction'
    ))
    
    interactions_df = pd.DataFrame(interactions_list)
    
    if interactions_df.empty:
        return get_popular_listings(limit)
    
   
    current_time = timezone.now()
    interactions_df['days_old'] = interactions_df.apply(
        lambda row: (current_time - row['last_interaction']).days 
        if isinstance(row['last_interaction'], datetime.datetime) 
        else 30,
        axis=1
    )
    
    
    def interaction_to_score(interaction_type, count, days_old):
        base_score = 0
        if interaction_type == 'favorit':
            base_score = count * 3.0                            
        elif interaction_type == 'contact':
            base_score = count * 2.0                            
        else:                                                   
            base_score = count * 1.0                          
            
     
        time_decay = 1.0 / (1.0 + 0.1 * min(days_old, 30))
        return base_score * time_decay
    

    interactions_df['score'] = interactions_df.apply(
        lambda row: interaction_to_score(
            row['interaction_type'], 
            row['interaction_count'], 
            row['days_old']
        ), 
        axis=1
    )
    
   
    interactions_matrix = interactions_df.groupby(['user_id', 'car_listing_id'])['score'].sum().reset_index()
    

    user_item_matrix = interactions_matrix.pivot(
        index='user_id', 
        columns='car_listing_id', 
        values='score'
    ).fillna(0)
    
    
    if user.id not in user_item_matrix.index:
        logger.info(f"Utilizatorul {user.username} nu are interacțiuni. Folosim content-based.")
        return content_based_recommendations(user, limit)
    
    
 
    user_item_sparse = csr_matrix(user_item_matrix.values)
    

    from sklearn.preprocessing import normalize
    user_item_normalized = normalize(user_item_sparse, norm='l2', axis=1)
    
   
    n_neighbors = min(max(5, user_item_normalized.shape[0] // 10), 20)
    
    
    model = NearestNeighbors(metric='cosine', algorithm='brute')
    model.fit(user_item_normalized)
    

    user_index = user_item_matrix.index.get_loc(user.id)
    user_vector = user_item_normalized[user_index].reshape(1, -1)
    
  
    distances, indices = model.kneighbors(
        user_vector, 
        n_neighbors=min(n_neighbors, user_item_normalized.shape[0])
    )
    
  
    similarity_weights = 1 / (1 + distances.flatten())
    

    similar_user_indices = indices.flatten()
    similar_users = [user_item_matrix.index[i] for i in similar_user_indices if i != user_index]
    
    if not similar_users:
        logger.info(f"Nu s-au găsit utilizatori similari pentru {user.username}. Folosim content-based.")
        return content_based_recommendations(user, limit)
    
 
    user_interactions = interactions_df[interactions_df['user_id'] == user.id]['car_listing_id'].unique()
    
   
    similar_users_interactions = interactions_df[
        (interactions_df['user_id'].isin(similar_users)) & 
        (~interactions_df['car_listing_id'].isin(user_interactions))
    ].copy()
    
   
    user_similarities = {}
    for i, similar_user_id in enumerate(similar_users):
        user_similarities[similar_user_id] = similarity_weights[i]
    

    
    similarity_dict = {user_id: user_similarities.get(user_id, 1.0) for user_id in similar_users_interactions['user_id'].unique()}
    similar_users_interactions['user_similarity'] = similar_users_interactions['user_id'].map(similarity_dict)
    similar_users_interactions['weighted_score'] = similar_users_interactions['score'] * similar_users_interactions['user_similarity']
    
    recommendation_scores = similar_users_interactions.groupby('car_listing_id')['weighted_score'].sum().reset_index()
    recommendation_scores = recommendation_scores.sort_values('weighted_score', ascending=False)
    
   
    recommended_listing_ids = recommendation_scores['car_listing_id'].tolist()
    
 
    recommended_listings = []
    if recommended_listing_ids:
     
        from django.db.models import Case, When
        preserved_order = Case(*[When(id=id, then=pos) for pos, id in enumerate(recommended_listing_ids)])
        recommended_listings = CarListing.objects.filter(id__in=recommended_listing_ids).exclude(user=user).order_by(preserved_order)
    
  
    def add_diversity(listings, max_per_brand=4):
        if not listings:
            return []
            
        diverse_results = []
        brands_added = set()
        
        diverse_results.append(listings[0])
        brands_added.add(listings[0].brand)
        
      
        remaining = list(listings[1:])
        
        for listing in remaining:
            brand_count = sum(1 for res in diverse_results if res.brand == listing.brand)
            
        
            if brand_count < max_per_brand or listing.brand not in brands_added:
                diverse_results.append(listing)
                brands_added.add(listing.brand)
                
              
                if len(diverse_results) >= limit:
                    break
        

        if len(diverse_results) < limit:
            for listing in remaining:
                if listing not in diverse_results:
                    diverse_results.append(listing)
                    if len(diverse_results) >= limit:
                        break
        
        return diverse_results
    
   
    if recommended_listings:
        recommended_listings = add_diversity(recommended_listings, max_per_brand=4)[:limit]
    
    
    def prioritize_preferred_fuel_type(listings):
        if not listings:
            return []
        
  
        user_favorites = Favorite.objects.filter(user=user)
        user_items = CarListing.objects.filter(
            id__in=list(user_favorites.values_list('car_listing_id', flat=True))
        )
        print(f"DEBUG: User ID: {user.id}")
        print(f"DEBUG: Favorite IDs din Favorite model: {list(user_favorites)}")
        print(f"DEBUG: Interacțiuni IDs: {list(user_interactions)}")
        
        
        fuel_type_counter = {}
        for item in user_items:
            if item.fuel_type in fuel_type_counter:
                fuel_type_counter[item.fuel_type] += 1
            else:
                fuel_type_counter[item.fuel_type] = 1
        
      
        if not fuel_type_counter:
            return listings
            
   
        preferred_fuel = max(fuel_type_counter.items(), key=lambda x: x[1])[0]
        
 
        preferred_fuel_listings = [listing for listing in listings if listing.fuel_type == preferred_fuel]
        other_fuel_listings = [listing for listing in listings if listing.fuel_type != preferred_fuel]
        
     
        return preferred_fuel_listings + other_fuel_listings
    
 
    if recommended_listings:
        recommended_listings = prioritize_preferred_fuel_type(recommended_listings)[:limit]
    
  
    if len(recommended_listings) < limit:
        content_recommendations = content_based_recommendations(user, limit - len(recommended_listings))
  
        existing_ids = [listing.id for listing in recommended_listings]
        for listing in content_recommendations:
            if listing.id not in existing_ids and len(recommended_listings) < limit:
                recommended_listings = list(recommended_listings) + [listing]
    
    return recommended_listings

def content_based_recommendations(user, limit=24):
    
    logger.info(f"Generarea recomandărilor cu Content-Based Filtering pentru utilizatorul {user.username}")
    
 
    user_favorites = Favorite.objects.filter(user=user).values_list('car_listing_id', flat=True)
    user_interactions = UserInteraction.objects.filter(
        user=user
    ).values_list('car_listing_id', flat=True)

    user_item_ids_for_learning = list(set(list(user_favorites) + list(user_interactions)))
    print(f"DEBUG: Anunțuri pentru învățare: {user_item_ids_for_learning}")
    

    user_item_ids_to_exclude = list(user_favorites) 
    
  
    if not user_item_ids_for_learning:
        logger.info(f"Utilizatorul {user.username} nu are interacțiuni. Se returnează anunțuri populare.")
        return get_popular_listings(limit)
    
 
    user_items = CarListing.objects.filter(id__in=user_item_ids_for_learning)
    
    
    user_preferences = analyze_user_preferences_enhanced(user_items, user.id)

    all_listings = CarListing.objects.exclude(id__in=user_item_ids_to_exclude).exclude(user=user)
 
    if all_listings.count() < 5:
        return get_popular_listings(limit)
    
    
    all_listings_data = []
    for listing in all_listings:
     
        price_category = 'premium' if listing.price and listing.price > 30000 else 'budget' if listing.price and listing.price < 10000 else 'mid-range'
        year_category = 'new' if listing.year_of_manufacture and listing.year_of_manufacture >= 2020 else 'recent' if listing.year_of_manufacture and listing.year_of_manufacture >= 2015 else 'older'
        mileage_category = 'low-mileage' if listing.mileage and listing.mileage < 50000 else 'high-mileage' if listing.mileage and listing.mileage > 150000 else 'average-mileage'
        
        listing_features = f"{listing.brand} {listing.brand} {listing.model} {listing.model} {listing.model} {listing.fuel_type} {listing.transmission} {getattr(listing, 'body_type', '')} {listing.condition_state} {price_category} {year_category} {mileage_category}"
        
       
        price_match = 1.0
        if listing.price and user_preferences['price_range']['avg'] > 0:
            price_range_min = user_preferences['price_range']['min'] * 0.9 if user_preferences['price_range']['min'] else 0
            price_range_max = user_preferences['price_range']['max'] * 1.1 if user_preferences['price_range']['max'] else float('inf')
            
            if listing.price < price_range_min:
              
                price_match = max(0.5, 1.0 - (price_range_min - listing.price) / price_range_min)
            elif listing.price > price_range_max:
               
                price_match = max(0.3, 1.0 - (listing.price - price_range_max) / price_range_max)
            else:
               
                price_match = 1.0
        
       
        year_match = 1.0
        if listing.year_of_manufacture and user_preferences['year_range']['avg'] > 0:
            year_diff = abs(listing.year_of_manufacture - user_preferences['year_range']['avg'])
          
            year_match = 1.0 - min(year_diff / 5, 1.0)
        
       
        mileage_match = 1.0
        if listing.mileage and user_preferences['mileage_range']['avg'] > 0:
        
            if listing.mileage > user_preferences['mileage_range']['avg']:
                mileage_diff = listing.mileage - user_preferences['mileage_range']['avg']
                mileage_match = 1.0 - min(mileage_diff / (user_preferences['mileage_range']['avg'] + 10000), 1.0)
            else:
               
                mileage_diff = user_preferences['mileage_range']['avg'] - listing.mileage
                mileage_match = 1.0 - min(mileage_diff / (user_preferences['mileage_range']['avg'] * 2), 0.3)
        
      
        power_match = 1.0
        if hasattr(listing, 'power') and listing.power and user_preferences['power_range']['avg'] > 0:
            power_diff = abs(listing.power - user_preferences['power_range']['avg'])
            power_match = 1.0 - min(power_diff / (user_preferences['power_range']['avg'] + 20), 1.0)
       
        body_type_match = 1.0
        if hasattr(listing, 'body_type') and listing.body_type:
            body_type_match = 1.0 if listing.body_type in user_preferences['body_types'] else 0.6
        
        

        days_since_listing = (timezone.now() - listing.created_at).days
        freshness_factor = 1.0 + max(0, (30 - days_since_listing) / 30) * 0.2  
        

        all_listings_data.append({
            'id': listing.id,
            'features': listing_features,
            'brand': listing.brand,
            'model': listing.model,
            'fuel_type': listing.fuel_type,
            'transmission': listing.transmission,
            'body_type': getattr(listing, 'body_type', ''),
            'price': listing.price,
            'year': listing.year_of_manufacture,
            'mileage': listing.mileage,
            'power': getattr(listing, 'power', 0),
            'price_match': price_match,
            'year_match': year_match,
            'mileage_match': mileage_match,
            'power_match': power_match,
            'body_type_match': body_type_match,
            'freshness_factor': freshness_factor
        })
    
 
    user_listings_data = []
    for listing in user_items:
     
        price_category = 'premium' if listing.price and listing.price > 30000 else 'budget' if listing.price and listing.price < 10000 else 'mid-range'
        year_category = 'new' if listing.year_of_manufacture and listing.year_of_manufacture >= 2020 else 'recent' if listing.year_of_manufacture and listing.year_of_manufacture >= 2015 else 'older'
        mileage_category = 'low-mileage' if listing.mileage and listing.mileage < 50000 else 'high-mileage' if listing.mileage and listing.mileage > 150000 else 'average-mileage'
        
        listing_features = f"{listing.brand} {listing.brand} {listing.model} {listing.model} {listing.model} {listing.fuel_type} {listing.transmission} {getattr(listing, 'body_type', '')} {listing.condition_state} {price_category} {year_category} {mileage_category}"
        user_listings_data.append(listing_features)
    

    all_listings_features = [item['features'] for item in all_listings_data]
    
    
    if not user_listings_data or not all_listings_features:
        return get_popular_listings(limit)
    
    
    tfidf = TfidfVectorizer(stop_words='english')
    
  
    all_features = user_listings_data + all_listings_features
    tfidf_matrix = tfidf.fit_transform(all_features)
    
   
    user_tfidf = tfidf_matrix[:len(user_listings_data)]
    listings_tfidf = tfidf_matrix[len(user_listings_data):]
    
  
    cosine_similarities = cosine_similarity(user_tfidf, listings_tfidf).mean(axis=0)
    
  
    for i, score in enumerate(cosine_similarities):
        all_listings_data[i]['tfidf_similarity'] = score
    
  
    price_variance = 0
    if user_preferences['price_range']['min'] and user_preferences['price_range']['max']:
        price_variance = (user_preferences['price_range']['max'] - user_preferences['price_range']['min']) / user_preferences['price_range']['avg'] if user_preferences['price_range']['avg'] else 0
    
    dominant_price_preference = price_variance < 0.3  
    
    max_brand_frequency = 0
    dominant_brand = None
    if user_preferences['brands']:
        max_brand_frequency = max(user_preferences['brands'].values())
        total_interactions = sum(user_preferences['brands'].values())
        dominant_brand = max(user_preferences['brands'].items(), key=lambda x: x[1])[0] if user_preferences['brands'] else None
    
    dominant_brand_preference = max_brand_frequency > 2 and (max_brand_frequency / total_interactions > 0.6 if total_interactions else False)
    

    dominant_fuel_preference = False
    dominant_fuel = None
    if user_preferences['fuel_types']:
        max_fuel_frequency = max(user_preferences['fuel_types'].values())
        total_fuel_interactions = sum(user_preferences['fuel_types'].values())
        
       
        print(f"DEBUG: Preferințe combustibil: {user_preferences['fuel_types']}")
        print(f"DEBUG: Combustibil dominant candidat: {max(user_preferences['fuel_types'].items(), key=lambda x: x[1])[0]}")
        print(f"DEBUG: Scor combustibil dominant: {max_fuel_frequency}, Total: {total_fuel_interactions}")
        print(f"DEBUG: Raport: {max_fuel_frequency/total_fuel_interactions if total_fuel_interactions else 0}")
        
       
        dominant_fuel_preference = (len(user_preferences['fuel_types']) == 1) or \
                                (max_fuel_frequency / total_fuel_interactions > 0.7)
        
      
        dominant_fuel = max(user_preferences['fuel_types'].items(), key=lambda x: x[1])[0]
    
    
    
    for item in all_listings_data:
      
        brand_match = 1.0 if item['brand'] in user_preferences['brands'] else 0.5
        transmission_match = 1.0 if item['transmission'] in user_preferences['transmission_types'] else 0.7
        
        
        model_match = 0.7  
        if dominant_brand and item['brand'] == dominant_brand:
           
            preferred_models = [key for key, value in user_preferences['models'].items() if value > 0 and key.startswith(dominant_brand)]
            if preferred_models and any(item['model'] in model for model in preferred_models):
                model_match = 1.0
        
      
        if dominant_fuel_preference:
          
            fuel_match = 1.0 if item['fuel_type'] == dominant_fuel else 0.5
        else:
        
            fuel_match = 1.0 if item['fuel_type'] in user_preferences['fuel_types'] else 0.7
        
       
        tfidf_weight = 0.25 
        brand_weight = 0.15  
        price_weight = 0.15  
        model_weight = 0.05  
        fuel_weight = 0.20   
        
        if dominant_fuel_preference:
           
            fuel_weight = 0.25      
            tfidf_weight = 0.25     
            brand_weight = 0.15      
            price_weight = 0.15      
            model_weight = 0.10    
        elif dominant_price_preference:
            price_weight = 0.25  
            brand_weight = 0.1   
            tfidf_weight = 0.25  
            fuel_weight = 0.15   
        elif dominant_brand_preference:
            price_weight = 0.1  
            brand_weight = 0.2   
            model_weight = 0.1   
            tfidf_weight = 0.25  
            fuel_weight = 0.15  
            

        base_score = (
            item['tfidf_similarity'] * tfidf_weight +  
            brand_match * brand_weight +             
            model_match * model_weight +              
            fuel_match * fuel_weight +                 
            transmission_match * 0.05 +                
            item['price_match'] * price_weight +      
            item['year_match'] * 0.05 +               
            item['mileage_match'] * 0.05 +           
            item['power_match'] * 0.05 +             
            item['body_type_match'] * 0.05           
        )
        
      
        item['final_score'] = base_score * item['freshness_factor']
    
    
    all_listings_data.sort(key=lambda x: x['final_score'], reverse=True)
    
  
    if dominant_fuel_preference:
        
        preferred_fuel_listings = [item for item in all_listings_data if item['fuel_type'] == dominant_fuel]
        other_fuel_listings = [item for item in all_listings_data if item['fuel_type'] != dominant_fuel]
        
     
        preferred_fuel_listings.sort(key=lambda x: x['final_score'], reverse=True)
        other_fuel_listings.sort(key=lambda x: x['final_score'], reverse=True)
        
   
        reserved_positions = min(max(3, int(limit * 0.5)), len(preferred_fuel_listings))
        
        
        all_listings_data = preferred_fuel_listings[:reserved_positions] + other_fuel_listings
    
    
    
    
    
    if dominant_fuel_preference:
      
        preferred_listings = [item for item in all_listings_data if item['fuel_type'] == dominant_fuel]
        other_listings = [item for item in all_listings_data if item['fuel_type'] != dominant_fuel]
        
      
        def apply_brand_diversity(items, max_same_brand=4):
            results = []
            brands = set()
            
           
            if items:
                results.append(items[0])
                brands.add(items[0]['brand'])
            
          
            remaining = [item for item in items[1:]]
            
            for item in remaining:
                brand_count = sum(1 for res in results if res['brand'] == item['brand'])
                
             
                if brand_count < max_same_brand or item['brand'] not in brands:
                    results.append(item)
                    brands.add(item['brand'])
            
            return results
        
    
        preferred_diverse = apply_brand_diversity(preferred_listings)
        other_diverse = apply_brand_diversity(other_listings)
        
   
        diverse_results = preferred_diverse + other_diverse
    else:
        
        diverse_results = []
        brands_added = set()
  
        if all_listings_data:
            diverse_results.append(all_listings_data[0])
            brands_added.add(all_listings_data[0]['brand'])
        
        
        remaining = [item for item in all_listings_data[1:]]
        max_same_brand = 4  
        
        for item in remaining:
            brand_count = sum(1 for res in diverse_results if res['brand'] == item['brand'])
            
           
            if brand_count < max_same_brand or item['brand'] not in brands_added:
                diverse_results.append(item)
                brands_added.add(item['brand'])
                
       
                if len(diverse_results) >= limit:
                    break
    
  
    if len(diverse_results) < limit:
        for item in remaining:
            if item not in diverse_results:
                diverse_results.append(item)
                if len(diverse_results) >= limit:
                    break
    
   
    recommended_listing_ids = [item['id'] for item in diverse_results][:limit]
    
    
    from django.db.models import Case, When
    preserved_order = Case(*[When(id=id, then=pos) for pos, id in enumerate(recommended_listing_ids)])
    
    return CarListing.objects.filter(id__in=recommended_listing_ids).order_by(preserved_order)


def analyze_user_preferences_enhanced(user_items, user_id=None):
   
    print("APELAT: analyze_user_preferences_enhanced (versiunea avansată)")
    preferences = {
        'brands': Counter(),
        'models': Counter(),
        'fuel_types': Counter(),
        'transmission_types': Counter(),
        'body_types': Counter(),
        'colors': Counter(),
        'price_range': {'min': None, 'max': None, 'avg': 0},
        'mileage_range': {'min': None, 'max': None, 'avg': 0},
        'year_range': {'min': None, 'max': None, 'avg': 0},
        'power_range': {'min': None, 'max': None, 'avg': 0}
    }
    if user_id is None:
        user_id = user_items.first().user.id if user_items.exists() else 0
    print(f"DEBUG: User ID în analyze_user_preferences_enhanced: {user_id}")
    
    total_price = 0
    total_mileage = 0
    total_year = 0
    total_power = 0
    count = 0
    
    
    favorites_ids_from_interactions = UserInteraction.objects.filter(
        user_id=user_id,
        interaction_type='favorit'
    ).values_list('car_listing_id', flat=True)
    
   
    favorites_ids_from_favorites = Favorite.objects.filter(
        user_id=user_id
    ).values_list('car_listing_id', flat=True)
    
 
    
    favorites_ids = list(set(list(favorites_ids_from_interactions) + list(favorites_ids_from_favorites)))
    
    print(f"DEBUG: Favorite IDs din UserInteraction: {list(favorites_ids_from_interactions)}")
    print(f"DEBUG: Favorite IDs din Favorite model: {list(favorites_ids_from_favorites)}")
    print(f"DEBUG: Favorite IDs combinate: {favorites_ids}")
    
    for listing in user_items:
       
        weight = 1.0
        
        
        if listing.id in favorites_ids:
            weight = 50.0
            print(f"DEBUG: Anunț {listing.id} (brand: {listing.brand}, model: {listing.model}, combustibil: {listing.fuel_type}) este favorit, pondere: {weight}")
        else:
       
            interactions = UserInteraction.objects.filter(
                user_id=user_id,
                car_listing_id=listing.id
            ).order_by('-interaction_type') 
            
        
            if interactions.exists():
            
                has_contact = False
                
                for interaction in interactions:
                    if interaction.interaction_type == 'contact':
                        weight = 5.0 
                        has_contact = True
                        print(f"DEBUG: Anunț {listing.id} (brand: {listing.brand}, model: {listing.model}, combustibil: {listing.fuel_type}) este contact, pondere: {weight}")
                        break
                
           
                if not has_contact:
                    weight = 0.01 
                    print(f"DEBUG: Anunț {listing.id} (brand: {listing.brand}, model: {listing.model}, combustibil: {listing.fuel_type}) este vizualizare, pondere: {weight}")
        
      
        count += weight
        
       
        preferences['brands'][listing.brand] += weight
        preferences['models'][f"{listing.brand} {listing.model}"] += weight
        preferences['fuel_types'][listing.fuel_type] += weight
        preferences['transmission_types'][listing.transmission] += weight
        
        
        if hasattr(listing, 'body_type') and listing.body_type:
            preferences['body_types'][listing.body_type] += weight
            
        if hasattr(listing, 'color') and listing.color:
            preferences['colors'][listing.color] += weight
        
       
        price = listing.price or 0
        mileage = listing.mileage or 0
        year = listing.year_of_manufacture or 0
        power = getattr(listing, 'power', 0)
        
        
        total_price += price * weight
        total_mileage += mileage * weight
        total_year += year * weight
        total_power += power * weight
        
       
        if preferences['price_range']['min'] is None or (price > 0 and price < preferences['price_range']['min']):
            preferences['price_range']['min'] = price
        if preferences['price_range']['max'] is None or price > preferences['price_range']['max']:
            preferences['price_range']['max'] = price
            
        if preferences['mileage_range']['min'] is None or (mileage > 0 and mileage < preferences['mileage_range']['min']):
            preferences['mileage_range']['min'] = mileage
        if preferences['mileage_range']['max'] is None or mileage > preferences['mileage_range']['max']:
            preferences['mileage_range']['max'] = mileage
            
        if preferences['year_range']['min'] is None or (year > 0 and year < preferences['year_range']['min']):
            preferences['year_range']['min'] = year
        if preferences['year_range']['max'] is None or year > preferences['year_range']['max']:
            preferences['year_range']['max'] = year
            
        if preferences['power_range']['min'] is None or (power > 0 and power < preferences['power_range']['min']):
            preferences['power_range']['min'] = power
        if preferences['power_range']['max'] is None or power > preferences['power_range']['max']:
            preferences['power_range']['max'] = power

    if count > 0:
        preferences['price_range']['avg'] = total_price / count
        preferences['mileage_range']['avg'] = total_mileage / count
        preferences['year_range']['avg'] = total_year / count
        preferences['power_range']['avg'] = total_power / count
    
   
    for counter_key in ['brands', 'models', 'fuel_types', 'transmission_types', 'body_types', 'colors']:
        counter = preferences[counter_key]

        total = sum(counter.values())
        if total > 0:
            preferences[counter_key] = Counter({k: v for k, v in counter.items() if v >= 2 or (v / total) >= 0.1})
    
    return preferences



def hybrid_recommendations(user, limit=24):
   
    logger.info(f"Generarea recomandărilor Hibride pentru utilizatorul {user.username}")
    
    try:
  
        collaborative_recs = collaborative_filtering_recommendations(user, limit=limit)
        content_based_recs = content_based_recommendations(user, limit=limit)
        
       
        
     
        collab_ids = [listing.id for listing in collaborative_recs]
        content_ids = [listing.id for listing in content_based_recs]
        
        
        combined_ids = []
        i, j = 0, 0
        
    
        while len(combined_ids) < limit and (i < len(collab_ids) or j < len(content_ids)):
            
            if i < len(collab_ids) and collab_ids[i] not in combined_ids:
                combined_ids.append(collab_ids[i])
            i += 1
            
         
            if len(combined_ids) >= limit:
                break
            
            if j < len(content_ids) and content_ids[j] not in combined_ids:
                combined_ids.append(content_ids[j])
            j += 1
        
     
        from django.db.models import Case, When
        
        
        if not combined_ids:
            return get_popular_listings(limit)
            
        preserved_order = Case(*[When(id=id, then=pos) for pos, id in enumerate(combined_ids)])
        
        return CarListing.objects.filter(id__in=combined_ids).exclude(user=user).order_by(preserved_order)[:limit]
    except Exception as e:
        logger.exception(f"Eroare în hybrid_recommendations: {str(e)}")
       
        return get_popular_listings(limit)


 

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_interaction(request):
   
    try:
        user = request.user
        listing_id = request.data.get('listing_id')
        interaction_type = request.data.get('type', 'vizualizare') 
        
        print(f"DEBUG: Interacțiune primită: user={user.username}, listing={listing_id}, type={interaction_type}")
        
        if not listing_id:
            return Response(
                {"error": "ID-ul anunțului este obligatoriu."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            car_listing = CarListing.objects.get(id=listing_id)
        except CarListing.DoesNotExist:
            return Response(
                {"error": "Anunțul specificat nu există."},
                status=status.HTTP_404_NOT_FOUND
            )
        
       
        interaction_mapping = {
            'view': 'vizualizare',
            'favorite': 'favorit',
            'click': 'vizualizare',
            'contact': 'contact'
        }
        
        db_interaction_type = interaction_mapping.get(interaction_type)
        
   
        if interaction_type == 'unfavorite':
            UserInteraction.objects.filter(
                user=user,
                car_listing=car_listing,
                interaction_type='favorit'
            ).delete()
            return Response({"status": "success"}, status=status.HTTP_200_OK)
        
       
        if not db_interaction_type:
            return Response(
                {"error": f"Tip de interacțiune nevalid: {interaction_type}"},
                status=status.HTTP_400_BAD_REQUEST
            )
        
   
        if db_interaction_type == 'vizualizare':
            try:
            
                recent_interaction = UserInteraction.objects.get(
                    user=user,
                    car_listing=car_listing,
                    interaction_type='vizualizare'
                )
                
            
                recent_interaction.interaction_count += 1  
                recent_interaction.last_interaction = timezone.now()
                recent_interaction.save()
                
                print(f"DEBUG: Interacțiune vizualizare actualizată: {recent_interaction.id}, count={recent_interaction.interaction_count}")
                
            except UserInteraction.DoesNotExist:
             
                new_interaction = UserInteraction.objects.create(
                    user=user,
                    car_listing=car_listing,
                    interaction_type='vizualizare',
                    interaction_count=1, 
                    last_interaction=timezone.now()
                )
                print(f"DEBUG: Interacțiune vizualizare nouă creată: {new_interaction.id}, count=0.01")
            
            return Response({"status": "success", "message": "Vizualizare înregistrată"}, status=status.HTTP_200_OK)
        else:
          
            interaction, created = UserInteraction.objects.get_or_create(
                user=user,
                car_listing=car_listing,
                interaction_type=db_interaction_type,
                defaults={'interaction_count': 1, 'last_interaction': timezone.now()}
            )
            
            
            if not created:
                if db_interaction_type == 'contact':
                 
                    interaction.interaction_count += 1.0
                elif db_interaction_type == 'favorit':
               
                    interaction.interaction_count = 1
                
                interaction.last_interaction = timezone.now()
                interaction.save()
                print(f"DEBUG: Interacțiune actualizată: {interaction.id}, type={db_interaction_type}")
            else:
                print(f"DEBUG: Interacțiune nouă creată: {interaction.id}, type={db_interaction_type}")
        
        return Response({"status": "success"}, status=status.HTTP_200_OK)
    
    except Exception as e:
        print(f"ERROR: Eroare la înregistrarea interacțiunii: {str(e)}")
        import traceback
        print(traceback.format_exc())
        return Response(
            {"error": f"A apărut o eroare la înregistrarea interacțiunii: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations_by_algorithm(request, algorithm):
    
    try:
        user = request.user
        
        if algorithm == 'collaborative':
            recommendations = collaborative_filtering_recommendations(user)
        elif algorithm == 'content':
            recommendations = content_based_recommendations(user)
        elif algorithm == 'hybrid':
            recommendations = hybrid_recommendations(user)
        else:
            return Response(
                {"error": "Algoritm necunoscut. Folosiți 'collaborative', 'content' sau 'hybrid'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
         
        if not isinstance(recommendations, list):
            recommendations = list(recommendations)
        
    
        recommendations = [listing for listing in recommendations if listing.user.id != user.id]
        
    
        recommendations = recommendations[:12]
        
        
        serializer = CarListingSerializer(recommendations, many=True, context={'request': request})
        return Response(serializer.data)
    
    except Exception as e:
        logger.exception(f"Eroare la generarea recomandărilor cu algoritmul {algorithm}: {str(e)}")
        return Response(
            {"error": f"A apărut o eroare la generarea recomandărilor: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
