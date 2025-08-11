"""
Apps — Django app configuration for the restaurantlist app.

Used by Django to discover the app and set defaults.
"""
from django.apps import AppConfig


class RestaurantlistConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'restaurantlist'
