from rest_framework import serializers
from .models import User
from django.contrib.auth.password_validation import validate_password

class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 
            'username', 
            'email', 
            'bio',
            'real_name', 
            'display_name', 
            'phone_number', 
            'city', 
            'county', 
            'profile_image', 
            'show_email', 
            'show_phone',
            'is_admin',
            'created_at',
            'is_active',
            'last_login',
            'last_activity',
            'is_online'
        ]
        # Excludem câmpurile sensibile precum parola
        extra_kwargs = {
            'password': {'write_only': True}
        }
    
    def to_representation(self, instance):
        # Obține reprezentarea standard
        representation = super().to_representation(instance)
        
        # Aplică opțiunile de confidențialitate
        if not instance.show_email:
            representation['email'] = None
        
        if not instance.show_phone:
            representation['phone_number'] = None
        
        return representation

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    admin_code = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'real_name', 'admin_code']

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Parolele nu se potrivesc"})
        # Verificăm codul de administrator dacă este furnizat
        admin_code = attrs.get('admin_code')
        if admin_code:
            # Setăm codul secret pentru administratori
            
            ADMIN_SECRET_CODE = "AutoLux2024Secret"  
            
            if admin_code != ADMIN_SECRET_CODE:
                raise serializers.ValidationError({"admin_code": "Cod de administrator invalid"})
        return attrs

    def create(self, validated_data):
        # Eliminăm câmpul password2 înainte de creare
        validated_data.pop('password2')
        
        # Verificăm dacă există un cod de administrator valid
        is_admin = False
        admin_code = validated_data.pop('admin_code', None)
        
        if admin_code:
            ADMIN_SECRET_CODE = "AutoLux2024Secret"  # Același cod secret ca în validate
            is_admin = admin_code == ADMIN_SECRET_CODE
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            real_name=validated_data['real_name'],
            password=validated_data['password'],
            is_admin=is_admin  # Setăm is_admin în funcție de validarea codului
        )
        return user

class UserUpdateSerializer(serializers.ModelSerializer):
    profile_image = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'real_name', 
            'phone_number', 
            'profile_image', 
            'display_name', 
            'city', 
            'county', 
            'bio', 
            'show_email', 
            'show_phone'
        ]
        extra_kwargs = {
            'real_name': {'required': False},
            'phone_number': {'required': False}
        }

    def update(self, instance, validated_data):
        # Actualizăm toate câmpurile din validated_data
        for attr, value in validated_data.items():
            if value is not None:
                setattr(instance, attr, value)
        
        instance.save()
        return instance