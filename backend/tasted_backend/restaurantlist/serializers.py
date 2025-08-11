"""
Serializers — DRF model serializers for Restaurant, Cuisine, Location, and Menu.

Responsibilities:
- Shape API responses for list/detail endpoints
- Provide write-only ID fields for assigning M2M relationships on Restaurant
- Expose absolute file URLs for Menu uploads via serializer method field
"""

from rest_framework import serializers
from .models import Restaurant, Cuisine, Location, Menu, MenuItem

# 🌱 Cuisine Serializer
class CuisineSerializer(serializers.ModelSerializer):
    """Serializes Cuisine objects for read-only display."""
    class Meta:
        model = Cuisine
        fields = ['id', 'name']


# 📍 Location Serializer
class LocationSerializer(serializers.ModelSerializer):
    """Serializes Location objects for read-only display."""
    class Meta:
        model = Location
        fields = ['id', 'name']


# 📄 Menu Serializer
class MenuSerializer(serializers.ModelSerializer):
    # Custom field to return full URL to the uploaded file
    file_url = serializers.SerializerMethodField()

    def get_file_url(self, obj):
        """
        Builds an absolute URL to the uploaded file using the request context.
        Ensures frontend can access the file directly.
        """
        request = self.context.get('request')
        if obj.file:
            return request.build_absolute_uri(obj.file.url)
        return None

    class Meta:
        model = Menu
        fields = ['id', 'title', 'file_url', 'page_number', 'restaurant']


# 🍽️ Restaurant Serializer
class RestaurantSerializer(serializers.ModelSerializer):
    """
    Serializes Restaurant objects with nested read-only fields
    and write-only ID fields for cuisine and location assignment.
    """
    # Nested read-only representations
    cuisines = CuisineSerializer(many=True, read_only=True)
    locations = LocationSerializer(many=True, read_only=True)
    menus = MenuSerializer(many=True, read_only=True)
    # Aggregate min/max price to support simple price range hints in detail
    min_item_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    max_item_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)
    average_item_price = serializers.DecimalField(max_digits=8, decimal_places=2, read_only=True)

    # Write-only fields for assigning relationships by ID
    cuisine_ids = serializers.PrimaryKeyRelatedField(
        queryset=Cuisine.objects.all(),
        many=True,
        write_only=True,
        source='cuisines'
    )
    location_ids = serializers.PrimaryKeyRelatedField(
        queryset=Location.objects.all(),
        many=True,
        write_only=True,
        source='locations'
    )

    class Meta:
        model = Restaurant
        fields = [
            'id',
            'name',
            'description',
            'image_url',
            'cuisines',      # Read-only nested
            'cuisine_ids',   # Write-only for assignment
            'locations',
            'location_ids',
            'menus',         # Read-only nested
            'min_item_price',
            'max_item_price',
            'average_item_price',
        ]