from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import CarListing, Favorite
from .serializers import CarListingSerializer, CarListingCreateSerializer, FavoriteSerializer
from .permissions import IsOwnerOrAdminOrReadOnly
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
import json
from .pagination import StandardResultsSetPagination
import logging

logger = logging.getLogger(__name__)

class CarListingViewSet(viewsets.ModelViewSet):
    queryset = CarListing.objects.all()
    permission_classes = [permissions.AllowAny]
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'brand': ['exact'],
        'model': ['exact', 'icontains'],
        'mileage': ['lt', 'gt', 'lte', 'gte'],
        'year_of_manufacture': ['lt', 'gt', 'lte', 'gte', 'exact'],
        'price': ['lt', 'gt', 'lte', 'gte'],
        'power': ['lt', 'gt', 'lte', 'gte'],
        'engine_capacity': ['lt', 'gt', 'lte', 'gte'],
        'fuel_type': ['exact'],
        'transmission': ['exact'],
        'drive_type': ['exact'],
        'condition_state': ['exact'],
        'emission_standard': ['exact'],
        'color': ['exact'],
    }
    search_fields = ['title', 'brand', 'model']  #am scos descriere ca daca cautam „audi„ imi oferea anunturi care au in desc „audio„
    ordering_fields = ['price', 'mileage', 'year_of_manufacture', 'created_at']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """
        Configurare permisiuni in funcție de acțiune.
        """
        if self.action in ['list', 'retrieve']:
            # Permitem oricui să vadă listele și detaliile
            return [AllowAny()]
        elif self.action in ['create', 'update', 'partial_update', 'destroy']:
            # Pentru a crea/edita/șterge anunțuri, utilizatorul trebuie să fie autentificat
            return [IsAuthenticated()]
        elif self.action == 'favorite':
            # Pentru a marca un anunț ca favorit, utilizatorul trebuie să fie autentificat
            return [IsAuthenticated()]
        else:
            # Pentru alte acțiuni, utilizăm permisiunea personalizată
            return [IsOwnerOrAdminOrReadOnly()]
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return CarListingCreateSerializer
        return CarListingSerializer
    
    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context
    
    def create(self, request, *args, **kwargs):
        print("Date primite:", request.data)
        print("Fișiere încărcate:", request.FILES)
    
            # Dacă features sunt trimise ca string, încearca să le convert
        if 'features' in request.data :
            try:
                request.data['features'] = json.loads(request.data['features'])
            except json.JSONDecodeError:
                print("Eroare la parsarea features")
                request.data['features'] = []
        
        serializer = self.get_serializer(data=request.data)
    
        try:
            serializer.is_valid(raise_exception=True)
            instance = self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
        
        # Returnam datele complete, inclusiv ID
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except Exception as e:
            print("Eroare la crearea anunțului:", str(e))
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
    # Salvează anunțul și asociază-l cu utilizatorul curent
        return serializer.save(user=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def favorite(self, request, pk=None):
        car_listing = self.get_object()
        user = request.user
        
        # Verificăm dacă anunțul este deja în favorite
        favorite, created = Favorite.objects.get_or_create(
            user=user,
            car_listing=car_listing
        )
        
        if not created:
            # Dacă există deja, îl ștergem (toggle)
            favorite.delete()
            return Response({"status": "removed from favorites"}, status=status.HTTP_200_OK)
        
        return Response({"status": "added to favorites"}, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_listings(self, request):
        print("User autentificat:", request.user.is_authenticated)
        print("Username:", request.user.username)
        queryset = self.filter_queryset(self.queryset.filter(user=request.user))
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)  

class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def loan_calculator(request):
    """
    Calculator de împrumut pentru finanțarea mașinilor.
    Parametri necesari:
    - price: Prețul mașinii
    - down_payment: Avansul (opțional, implicit 0)
    - loan_term: Durata împrumutului în luni (opțional, implicit 60)
    - interest_rate: Rata dobânzii anuale (opțional, implicit 7.5%)
    """
    price = request.data.get('price')
    down_payment = request.data.get('down_payment', 0)
    loan_term = request.data.get('loan_term', 60)  # durata luni
    interest_rate = request.data.get('interest_rate', 7.5)  # rata anual în procente
    
    if not price:
        return Response(
            {"error": "Prețul mașinii este obligatoriu"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        price = float(price)
        down_payment = float(down_payment)
        loan_term = int(loan_term)
        interest_rate = float(interest_rate)
    except (ValueError, TypeError):
        return Response(
            {"error": "Valorile introduse trebuie să fie numere"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Calculul valorii împrumutului
    loan_amount = price - down_payment
    
    # Dacă avansul este mai mare sau egal cu prețul
    if loan_amount <= 0:
        return Response(
            {"error": "Avansul nu poate fi mai mare sau egal cu prețul mașinii"}, 
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Conversia ratei dobânzii anuale în rată lunară
    monthly_interest_rate = interest_rate / 100 / 12
    
    # Calculul plății lunare folosind formula standard pentru împrumut
    monthly_payment = loan_amount * (monthly_interest_rate * (1 + monthly_interest_rate) ** loan_term) / ((1 + monthly_interest_rate) ** loan_term - 1)
    
    # Calculul dobânzii totale
    total_payment = monthly_payment * loan_term
    total_interest = total_payment - loan_amount
    
    # Crearea unui plan de rambursare
    payment_schedule = []
    remaining_balance = loan_amount
    
    for month in range(1, loan_term + 1):
        interest_payment = remaining_balance * monthly_interest_rate
        principal_payment = monthly_payment - interest_payment
        remaining_balance -= principal_payment
        
        if month <= 12 or month % 12 == 0 or month == loan_term:  # Primele 12 luni, lunile din an și ultima lună
            payment_schedule.append({
                'month': month,
                'payment': round(monthly_payment, 2),
                'principal': round(principal_payment, 2),
                'interest': round(interest_payment, 2),
                'remaining_balance': round(max(0, remaining_balance), 2)
            })
    
    result = {
        'loan_amount': round(loan_amount, 2),
        'monthly_payment': round(monthly_payment, 2),
        'total_payment': round(total_payment, 2),
        'total_interest': round(total_interest, 2),
        'payment_schedule': payment_schedule,
        'summary': {
            'down_payment_percentage': round((down_payment / price) * 100, 2),
            'loan_term_years': loan_term / 12,
            'annual_interest_rate': interest_rate
        }
    }
    
    return Response(result)

@api_view(['GET'])
@permission_classes([AllowAny])
def user_listings(request, user_id):
    """Returnează toate anunțurile publice ale unui utilizator"""
    try:
        # Obține anunțurile utilizatorului specificat - folosim modelul CarListing
        listings = CarListing.objects.filter(user_id=user_id)
        
        # Verifică dacă există câmpul is_active în model și folosește-l pentru filtrare dacă există
        if hasattr(CarListing, 'is_active'):
            listings = listings.filter(is_active=True)
        
        # Ordonează după data creării (descrescător)
        listings = listings.order_by('-created_at')
        
        # Serializarea anunțurilor
        serializer = CarListingSerializer(listings, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        # Log exact error debugging
        logger.error(f"Error in user_listings view: {str(e)}")
        
        return Response(
            {'error': f'Eroare la obținerea anunțurilor: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def similar_listings(request, pk):
    """
    Returnează anunțuri similare cu anunțul specificat.
    Similitudinea este determinată de marca, model, combustibil și an de fabricație.
    """
    try:
        # Obținem anunțul de referință
        car_listing = CarListing.objects.get(pk=pk)
        
        
        # Marca este cel mai important, apoi modelul, combustibilul și anul fabricației
        similar_listings = CarListing.objects.filter(
            brand=car_listing.brand  # Căutăm aceeași marcă
        ).exclude(
            id=pk  # Excludem anunțul curent
        )
        
        # Filtrăm și după model dacă sunt mai mult de 10 rezultate
        if similar_listings.count() > 10:
            model_similar = similar_listings.filter(model=car_listing.model)
            if model_similar.count() >= 3:  # Dacă găsim suficiente cu același model
                similar_listings = model_similar
        
        # Adăugăm un scor de similitudine pentru a sorta rezultatele
        similar_with_score = []
        for listing in similar_listings:
            score = 0
            
            # Marca este identică (valoare mare)
            score += 100
            
            # Verificăm modelul (al doilea ca importanță)
            if listing.model == car_listing.model:
                score += 50
            
            # Verificăm combustibilul
            if listing.fuel_type == car_listing.fuel_type:
                score += 25
            
            # Verificăm proximitatea anului de fabricație (cu cât e mai aproape, cu atât e mai similar)
            year_diff = abs(listing.year_of_manufacture - car_listing.year_of_manufacture)
            if year_diff == 0:
                score += 25
            elif year_diff <= 2:
                score += 20
            elif year_diff <= 5:
                score += 15
            elif year_diff <= 10:
                score += 10
            
            similar_with_score.append((listing, score))
        
        # Sortăm după scorul de similitudine
        similar_with_score.sort(key=lambda x: x[1], reverse=True)
        
        # Luăm primele 6 rezultate
        top_similar = [item[0] for item in similar_with_score[:6]]
        
        # Dacă nu avem suficiente rezultate, adăugăm și alte mașini din aceeași categorie de preț
        if len(top_similar) < 3:
            price_range_min = car_listing.price * 0.7  # -30%
            price_range_max = car_listing.price * 1.3  # +30%
            
            additional_listings = CarListing.objects.filter(
                price__gte=price_range_min,
                price__lte=price_range_max
            ).exclude(
                id=pk
            ).exclude(
                id__in=[l.id for l in top_similar]
            ).order_by('?')[:6-len(top_similar)]  # Completăm până la 6 rezultate random
            
            top_similar.extend(additional_listings)
        
        # Serializăm rezultatele
        serializer = CarListingSerializer(top_similar, many=True, context={'request': request})
        return Response(serializer.data)
    
    except CarListing.DoesNotExist:
        return Response(
            {"error": "Anunțul specificat nu există."},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error in similar_listings view: {str(e)}")
        return Response(
            {"error": f"A apărut o eroare: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )