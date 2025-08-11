"""
Models — Core database entities for the Tasted backend.

Entities:
- Cuisine: e.g., Thai, Italian
- Location: geographic area/zone
- Restaurant: name, description, image, M2M to cuisines/locations
- Menu: uploaded file linked to a Restaurant, optional page number

Notes:
- The unique_together on Menu prevents duplicate titles per restaurant/page
- MEDIA settings must be configured to serve uploaded files
"""

from django.db import models

class Cuisine(models.Model):
    """Represents a cuisine type (e.g. Italian, Thai, Vegan)."""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Location(models.Model):
    """Represents a geographic location or delivery zone."""
    name = models.CharField(max_length=50, unique=True)

    def __str__(self):
        return self.name


class Restaurant(models.Model):
    """Core restaurant entity with name, branding, and associations."""
    name = models.CharField(max_length=100, unique=True)

    # Many-to-many relationships for flexible categorization
    cuisines = models.ManyToManyField(Cuisine, related_name='restaurants')
    locations = models.ManyToManyField(Location, related_name='restaurants')

    image_url = models.URLField(blank=True, null=True)  # Optional branding image
    description = models.TextField(blank=True)          # Optional summary or tagline

    def __str__(self):
        return self.name


class Menu(models.Model):
    """
    Represents a menu file (PDF or image) manually uploaded for a restaurant.
    Each menu can optionally include a page number for multi-page documents.
    """

    # Link this menu to a specific restaurant
    restaurant = models.ForeignKey(
        'Restaurant',                  # Reference to the Restaurant model
        related_name='menus',          # Allows access via restaurant.menus
        on_delete=models.CASCADE       # Deletes menus if restaurant is deleted
    )

    # Short title for the menu (e.g. "Lunch Menu", "Drinks")
    title = models.CharField(
        max_length=100,
        help_text="Short title or description of the menu"
    )

    # File upload field for PDF or image menus
    file = models.FileField(
        upload_to='menus/', null=True, blank=True,           # Files will be stored in MEDIA_ROOT/menus/
        help_text="Upload a PDF or image file for this menu"
    )

    # Optional page number for multi-page menus
    page_number = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Optional page number for multi-page menus"
    )

    class Meta:
        ordering = ['restaurant__name', 'title', 'page_number']  # Default sort order
        unique_together = ('restaurant', 'title', 'page_number') # Prevent duplicate entries

    def __str__(self):
        """
        String representation used in admin and logs.
        Includes restaurant name, menu title, and page number if present.
        """
        page = f"Page {self.page_number}" if self.page_number else "Single Page"
        return f"{self.restaurant.name} - {self.title} ({page})"