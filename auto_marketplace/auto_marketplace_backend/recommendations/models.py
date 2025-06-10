from django.db import models
from django.utils import timezone
from users.models import User
from listings.models import CarListing

class UserInteraction(models.Model):
    INTERACTION_CHOICES = (
        ('vizualizare', 'Vizualizare'),
        ('favorit', 'Favorit'),
        ('contact', 'Contact'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='interactions')
    car_listing = models.ForeignKey(CarListing, on_delete=models.CASCADE, related_name='interactions')
    interaction_type = models.CharField(max_length=15, choices=INTERACTION_CHOICES)
    interaction_count = models.FloatField(default=1.0)
    last_interaction = models.DateTimeField(auto_now=True)
    first_interaction = models.DateTimeField(auto_now_add=True)
    # Câmp pentru stocarea scorului interacțiunii, util pentru algoritmi de recomandare
    interaction_score = models.FloatField(default=0.0)
    
    class Meta:
        db_table = 'user_interactions'
        unique_together = ('user', 'car_listing', 'interaction_type')
        indexes = [
            models.Index(fields=['user', 'interaction_type']),
            models.Index(fields=['car_listing', 'interaction_type']),
            models.Index(fields=['last_interaction']),
        ]
        
    def __str__(self):
        return f"{self.user.username} - {self.car_listing} - {self.interaction_type}"
    
    def save(self, *args, **kwargs):
        # Calculăm un scor pentru interacțiune bazat pe tipul și frecvența acesteia
        if self.interaction_type == 'favorit':
            self.interaction_score = 50.0
        elif self.interaction_type == 'contact':
            self.interaction_score = self.interaction_count * 5.0
        else:  # vizualizare
            self.interaction_score = self.interaction_count * 0.1
            
        # Aplicăm și un factor de decădere temporală 
        days_since_first = (timezone.now() - self.first_interaction).days if self.first_interaction else 0
        if days_since_first > 0:
            decay_factor = 1.0 / (1.0 + 0.1 * days_since_first)  # Factorul de decădere scade cu timpul
            self.interaction_score *= decay_factor
            
        super().save(*args, **kwargs)
    
    @classmethod
    def get_user_item_matrix(cls):
        """
        Returnează o matrice utilizator-item pentru a fi folosită în algoritmii de recomandare.
        Folosită în Collaborative Filtering.
        """
        interactions = cls.objects.all().values('user_id', 'car_listing_id', 'interaction_score')
        user_item_dict = {}
        
        for interaction in interactions:
            user_id = interaction['user_id']
            item_id = interaction['car_listing_id']
            score = interaction['interaction_score']
            
            if user_id not in user_item_dict:
                user_item_dict[user_id] = {}
                
            if item_id in user_item_dict[user_id]:
                user_item_dict[user_id][item_id] += score
            else:
                user_item_dict[user_id][item_id] = score
                
        return user_item_dict
    
    @classmethod
    def get_similar_users(cls, user_id, n=10):
        """
        Găsește utilizatori similari bazat pe interacțiunile comune.
        Folosită în Collaborative Filtering.
        """
        
        return []
    
    @classmethod
    def get_user_preferences(cls, user_id):
        """
        Calculează preferințele unui utilizator bazate pe interacțiunile sale.
        Folosită în Content-Based Filtering.
        """
        user_interactions = cls.objects.filter(user_id=user_id).select_related('car_listing')
        
        preferences = {
            'brands': {},
            'fuel_types': {},
            'transmission_types': {},
            'price_range': {'min': None, 'max': None, 'avg': 0},
            'year_range': {'min': None, 'max': None, 'avg': 0},
        }
        
        
        
        return preferences