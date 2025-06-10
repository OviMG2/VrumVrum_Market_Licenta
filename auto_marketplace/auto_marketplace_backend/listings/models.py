from django.db import models
from users.models import User

class CarListing(models.Model):
    CONDITION_CHOICES = (
        ('nou', 'Nou'),
        ('utilizat', 'Utilizat'),
        ('avariat', 'Avariat'),
    )
    
    FUEL_CHOICES = (
        ('benzina', 'Benzină'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hibrid', 'Hibrid'),
        ('GPL', 'GPL'),
        ('altele', 'Altele'),
    )
    
    TRANSMISSION_CHOICES = (
        ('manuala', 'Manuală'),
        ('automata', 'Automată'),
        ('semi-automata', 'Semi-automată'),
    )
    
    DRIVE_TYPE_CHOICES = (
        ('fata', 'Față'),
        ('spate', 'Spate'),
        ('4x4', '4x4'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='car_listings')
    title = models.CharField(max_length=255)
    brand = models.CharField(max_length=50)
    model = models.CharField(max_length=50)
    mileage = models.PositiveIntegerField()
    power = models.PositiveIntegerField()
    engine_capacity = models.PositiveIntegerField()
    color = models.CharField(max_length=30)
    condition_state = models.CharField(max_length=10, choices=CONDITION_CHOICES)
    year_of_manufacture = models.PositiveSmallIntegerField()
    fuel_type = models.CharField(
    max_length=20,
    choices=[
        ('benzina', 'Benzină'),
        ('diesel', 'Diesel'),
        ('electric', 'Electric'),
        ('hibrid_benzina', 'Hibrid Benzină'),
        ('hibrid_diesel', 'Hibrid Diesel'),
        ('GPL', 'GPL'),
        ('altele', 'Altele')
    ],
    verbose_name="Tip combustibil"
    )
    price = models.IntegerField()
    emission_standard = models.CharField(max_length=20)
    transmission = models.CharField(max_length=15, choices=TRANSMISSION_CHOICES)
    drive_type = models.CharField(max_length=5, choices=DRIVE_TYPE_CHOICES)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    body_type = models.CharField(max_length=50, null=True, blank=True, verbose_name="Tip caroserie")
    right_hand_drive = models.BooleanField(default=False, verbose_name="Volan pe dreapta")
    co2_emissions = models.IntegerField(null=True, blank=True, verbose_name="Emisii CO2 (g/km)")
    seats = models.IntegerField(null=True, blank=True, verbose_name="Număr locuri")
    doors = models.IntegerField(null=True, blank=True, verbose_name="Număr uși")
    registered = models.BooleanField(default=False, verbose_name="Înmatriculat")
    location = models.CharField(max_length=100, null=True, blank=True, verbose_name="Localitate")
    
    def __str__(self):
        return f"{self.brand} {self.model} ({self.year_of_manufacture})"
    
    class Meta:
        db_table = 'car_listings'
        ordering = ['-created_at']

class CarImage(models.Model):
    car_listing = models.ForeignKey(CarListing, on_delete=models.CASCADE, related_name='images')
    image_path = models.ImageField(upload_to='car_images/')
    is_main = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Imagine pentru {self.car_listing}"
    
    class Meta:
        db_table = 'car_images'

class CarFeature(models.Model):
    car_listing = models.ForeignKey(CarListing, on_delete=models.CASCADE, related_name='features')
    feature_name = models.CharField(max_length=100)
    feature_value = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.feature_name}: {self.feature_value}"
    
    class Meta:
        db_table = 'car_features'


class Favorite(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    car_listing = models.ForeignKey(CarListing, on_delete=models.CASCADE, related_name='favorited_by')
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'favorites'
        unique_together = ('user', 'car_listing')
        
    def __str__(self):
        return f"{self.user.username} - {self.car_listing}"