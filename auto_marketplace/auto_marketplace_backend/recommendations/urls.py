from django.urls import path
from .views import for_you_recommendations, record_interaction, get_recommendations_by_algorithm

urlpatterns = [
    path('for_you/', for_you_recommendations, name='for-you-recommendations'),
    path('interactions/', record_interaction, name='record-interaction'),
    path('algorithm/<str:algorithm>/', get_recommendations_by_algorithm, name='get-recommendations-by-algorithm'),
]