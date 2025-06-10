from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CarListingViewSet, FavoriteViewSet, loan_calculator, user_listings, similar_listings

router = DefaultRouter()
router.register(r'cars', CarListingViewSet, basename='car-listing')
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
    path('calculator/', loan_calculator, name='loan-calculator'),
    path('user/<int:user_id>/', user_listings, name='user-listings'),  
    path('cars/<int:pk>/similar_listings/', similar_listings, name='similar-listings'),
]