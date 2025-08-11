"""
Admin — Django admin registrations for app models.

Provides simple management UI for Restaurant, Cuisine, Location, and Menu.
Search fields on Menu support quick lookups by title or restaurant.
"""
from django.contrib import admin  # Imports Django's admin interface tools
from .models import Restaurant, Cuisine, Location  # Imports your models from models.py
from .models import Menu, MenuItem

@admin.register(Menu)
class MenuAdmin(admin.ModelAdmin):
    """
    Admin interface for uploading and managing menu files.
    Allows search by title and restaurant name.
    """
    list_display = ('title', 'restaurant', 'page_number')
    search_fields = ('title', 'restaurant__name')


# Registers the Restaurant model so you can add/edit/delete restaurants via the admin site
admin.site.register(Restaurant)

# Registers the Cuisine model so you can manage cuisine types (e.g., Thai, Italian) via admin
admin.site.register(Cuisine)

# Registers the Location model so you can manage geographic locations (e.g., Durban, Cape Town)
admin.site.register(Location)

@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'restaurant', 'price')
    search_fields = ('name', 'restaurant__name')