from rest_framework import serializers
from .models import CarListing, CarImage, CarFeature, Favorite
from users.serializers import UserSerializer
import json

class CarFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarFeature
        fields = ['id', 'feature_name', 'feature_value']
        read_only_fields = ['id']

class CarImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CarImage
        fields = ['id', 'image_path', 'is_main']
        read_only_fields = ['id']

class CarListingSerializer(serializers.ModelSerializer):
    images = CarImageSerializer(many=True, read_only=True)
    features = CarFeatureSerializer(many=True, read_only=True)
    is_favorite = serializers.SerializerMethodField()
    
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = CarListing
        fields = [
            'id', 'user', 'title', 'brand', 'model', 'mileage', 'power',
            'engine_capacity', 'color', 'condition_state', 'year_of_manufacture',
            'fuel_type', 'price', 'emission_standard', 'transmission', 'drive_type',
            'description', 'created_at', 'updated_at', 'images', 'features',
            'is_favorite', 'body_type', 'right_hand_drive', 'co2_emissions', 
            'seats', 'doors', 'registered', 'location'
        ]
        read_only_fields = ['id', 'user', 'created_at', 'is_favorite']
    
    def get_is_favorite(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Favorite.objects.filter(user=request.user, car_listing=obj).exists()
        return False
    def to_representation(self, instance):
        rep = super().to_representation(instance)
     
        return rep

class CarListingCreateSerializer(serializers.ModelSerializer):
    images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    new_images = serializers.ListField(
        child=serializers.ImageField(),
        required=False,
        write_only=True
    )
    images_to_delete = serializers.JSONField(required=False, write_only=True)
    features = CarFeatureSerializer(many=True, required=False)
    
    class Meta:
        model = CarListing
        fields = [
            'id',  
            'title', 'brand', 'model', 'mileage', 'power', 
            'engine_capacity', 'color', 'condition_state', 'year_of_manufacture', 
            'fuel_type', 'price', 'emission_standard', 'transmission', 'drive_type', 
            'description', 'images', 'new_images', 'images_to_delete', 'features',
            'body_type', 'right_hand_drive', 'co2_emissions', 
            'seats', 'doors', 'registered', 'location'
        ]
        read_only_fields = ['id']
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        features_data = []
        raw_features = self.context['request'].data.get('features', [])
        if isinstance(raw_features, list) and raw_features:
       
            if len(raw_features) == 1 and isinstance(raw_features[0], str):
                try:
                  
                    features_data = json.loads(raw_features[0])
                    print("Features după parsare din list[0] (create):", features_data)
                except json.JSONDecodeError as e:
                    print(f"Eroare la parsarea features din list[0] (create): {e}")
                    features_data = []
            else:
          
                features_data = raw_features
                print("Features luate direct din raw_features ca listă (create):", features_data)
        elif isinstance(raw_features, str):
          
            try:
                features_data = json.loads(raw_features)
                print("Features după parsare din string (create):", features_data)
            except json.JSONDecodeError as e:
                print(f"Eroare la parsarea features din string (create): {e}")
                features_data = []
                
        validated_data.pop('features', None)
        
    
        validated_data.pop('new_images', None)
        validated_data.pop('images_to_delete', None)
        
      
        validated_data['user'] = self.context['request'].user
        
   
        car_listing = CarListing.objects.create(**validated_data)
        
    
        for i, image_data in enumerate(images_data):
            CarImage.objects.create(
                car_listing=car_listing,
                image_path=image_data,
                is_main=(i == 0)  
            )
        
          
        if features_data:
            for feature_data in features_data:
                feature_name = feature_data.get('feature_name', '').strip()
                if feature_name:
                    CarFeature.objects.create(
                        car_listing=car_listing,
                        feature_name=feature_name,
                        feature_value=feature_data.get('feature_value', '').strip()
                    )
                    print(f"Feature creat: {feature_name}")
        
        return car_listing
    
    def update(self, instance, validated_data):
        
        new_images_data = validated_data.pop('new_images', [])
        images_to_delete = validated_data.pop('images_to_delete', [])
        features_data = []
        raw_features = self.context['request'].data.get('features', [])
        print("Raw features din request.data:", raw_features, "tip:", type(raw_features))
        
        
        print("Tipul features_data înainte de procesare:", type(features_data))
        print("Conținutul features_data înainte de procesare:", features_data)
        
        
        if isinstance(raw_features, list) and raw_features:
       
            if len(raw_features) == 1 and isinstance(raw_features[0], str):
                try:
                    
                    features_data = json.loads(raw_features[0])
                    print("Features după parsare din list[0]:", features_data)
                except json.JSONDecodeError as e:
                    print(f"Eroare la parsarea features din list[0]: {e}")
                    features_data = []
            else:
       
                features_data = raw_features
                print("Features luate direct din raw_features ca listă:", features_data)
        elif isinstance(raw_features, str):
     
            try:
                features_data = json.loads(raw_features)
                print("Features după parsare din string:", features_data)
            except json.JSONDecodeError as e:
                print(f"Eroare la parsarea features din string: {e}")
                features_data = []
        
        print("Features_data final după toată procesarea:", features_data)
        validated_data.pop('features', None)
         
      
        validated_data.pop('images', None)
        
      
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
  
        if images_to_delete:
            if isinstance(images_to_delete, str):
                try:
                    images_to_delete = json.loads(images_to_delete)
                except:
                    images_to_delete = []
            
            CarImage.objects.filter(id__in=images_to_delete, car_listing=instance).delete()
        
       
        current_images = CarImage.objects.filter(car_listing=instance)
        has_main_image = current_images.filter(is_main=True).exists()
        
        for i, image_data in enumerate(new_images_data):
           
            is_main = (i == 0 and not has_main_image)
            CarImage.objects.create(
                car_listing=instance,
                image_path=image_data,
                is_main=is_main
            )
      
        print("Features ce vor fi create:", features_data)
        CarFeature.objects.filter(car_listing=instance).delete()
      
        if features_data:
            for feature_data in features_data:
              
                if isinstance(feature_data, dict):
                    feature_name = feature_data.get('feature_name', '').strip()
                    feature_value = feature_data.get('feature_value', '').strip()
                else:
                    print(f"Ignorat feature invalid (nu este dict): {feature_data}")
                    continue
              
                if feature_name:
                    feature = CarFeature.objects.create(
                        car_listing=instance,
                        feature_name=feature_name,
                        feature_value=feature_data.get('feature_value', '').strip()
                    )
                    print(f"Feature salvat în baza de date: {feature}")
                else:
                    print(f"Feature ignorat (nume gol): {feature_data}")
        else:
            print("Nu s-au găsit features de salvat.")
        
        return instance
    
    def to_representation(self, instance):
       
        return CarListingSerializer(instance, context=self.context).data

class FavoriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'car_listing', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)
