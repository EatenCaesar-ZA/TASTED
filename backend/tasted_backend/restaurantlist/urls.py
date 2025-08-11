"""
App URLs — Routes for the restaurantlist app.

Registers DRF viewsets using DefaultRouter.
Exposes read-only endpoints for cuisines/locations for filter dropdowns.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RestaurantViewSet, MenuViewSet, CuisineViewSet, LocationViewSet

router = DefaultRouter()
router.register(r'restaurants', RestaurantViewSet, basename='restaurant')
router.register(r'menus', MenuViewSet, basename='menu')
router.register(r'cuisines', CuisineViewSet, basename='cuisine')
router.register(r'locations', LocationViewSet, basename='location')

urlpatterns = [
    path('', include(router.urls)),
]