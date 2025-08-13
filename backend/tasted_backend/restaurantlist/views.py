"""
Views — Django REST Framework viewsets and filters for the Tasted API.

Responsibilities:
- Expose CRUD for Restaurants and Menus
- Provide read-only endpoints for Cuisine and Location filters
- Support searching and filtering across related models

Notes:
- Keep default permissions restrictive in settings; explicitly open public endpoints here
- Add pagination/ordering on the DRF side; frontend already tolerates both paginated and non-paginated
"""

from django.http import HttpResponse
from rest_framework import viewsets, filters
from rest_framework.permissions import AllowAny

# ✅ Filtering support
from django_filters.rest_framework import (
    DjangoFilterBackend,
    FilterSet,
    BaseInFilter,
    CharFilter,
    NumberFilter,
)

# ✅ Local models and serializers
from .models import Restaurant, Menu, Cuisine, Location
from django.db.models import Min, Max, Avg, Q
from .serializers import RestaurantSerializer, MenuSerializer, CuisineSerializer, LocationSerializer

# 🍽️ MenuViewSet — CRUD for individual menu files
class MenuViewSet(viewsets.ModelViewSet):
    """
    List, create, retrieve, update, delete individual menu files.

    Endpoint:
      • GET /api/menus/           → list all menus
      • POST /api/menus/          → create new menu
      • GET /api/menus/<id>/      → retrieve specific menu
      • PUT/PATCH /api/menus/<id>/→ update menu
      • DELETE /api/menus/<id>/   → delete menu
    """
    queryset = Menu.objects.all().order_by('title', 'page_number')  # 🔧 Explicit ordering for consistent pagination
    serializer_class = MenuSerializer
    permission_classes = [AllowAny]


# 🍜 CuisineViewSet — list cuisines for filters
class CuisineViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only list/retrieve for cuisines used as filter options."""
    queryset = Cuisine.objects.all().order_by('name')
    serializer_class = CuisineSerializer
    permission_classes = [AllowAny]


# 📍 LocationViewSet — list locations for filters
class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    """Read-only list/retrieve for locations used as filter options."""
    queryset = Location.objects.all().order_by('name')
    serializer_class = LocationSerializer
    permission_classes = [AllowAny]

# 🧠 RestaurantFilter — supports multi-value and related model filtering
class CharInFilter(BaseInFilter, CharFilter):
    """Helper to support CSV or repeated query params for char fields."""
    pass


class NumberInFilter(BaseInFilter, NumberFilter):
    """Helper to support CSV or repeated query params for numeric fields."""
    pass


class RestaurantFilter(FilterSet):
    """
    Custom filters to support multi-value and related model queries.

    Supports:
      • ?cuisines__name=Thai&cuisines__name=Indian       → filter by multiple cuisines
      • ?locations__name=Durban&locations__name=Cape Town→ filter by multiple locations
      • ?menu_title=Lunch                                → filter by menu title (partial match)
      • ?menu_page=2                                     → filter by menu page number
    """

    # ✅ Multi-value filters for related cuisines and locations (by name)
    cuisines__name = CharInFilter(field_name='cuisines__name', lookup_expr='in')
    locations__name = CharInFilter(field_name='locations__name', lookup_expr='in')
    # Flexible single-value, case-insensitive filters (synonyms for convenience)
    cuisine = CharFilter(field_name='cuisines__name', lookup_expr='icontains')
    location = CharFilter(field_name='locations__name', lookup_expr='icontains')

    # ✅ Support filtering by related IDs as well (useful for dropdowns)
    cuisines = NumberInFilter(field_name='cuisines__id', lookup_expr='in')
    locations = NumberInFilter(field_name='locations__id', lookup_expr='in')

    # ✅ Filters for related Menu model (via ForeignKey with related_name='menus')
    menu_title = CharFilter(
        field_name='menus__title',
        lookup_expr='icontains',
        label='Menu Title'
    )
    menu_page = CharFilter(
        field_name='menus__page_number',
        lookup_expr='exact',
        label='Menu Page Number'
    )

    # ✅ Price range filtering (less strict):
    # - min_price: allow restaurants with ANY menu item >= value OR tagged max >= value
    # - max_price: allow restaurants with ANY menu item <= value OR tagged min <= value
    # - price: single target value; include restaurants whose range (items or tags) includes the value
    min_price = NumberFilter(method='filter_min_price')
    max_price = NumberFilter(method='filter_max_price')
    price = NumberFilter(method='filter_price')

    def filter_min_price(self, queryset, name, value):
        """Use price TAGS only: include restaurants with min_price_tag >= value."""
        q = Q(min_price_tag__isnull=False, min_price_tag__gte=value)
        return queryset.filter(q).distinct()

    def filter_max_price(self, queryset, name, value):
        """Use price TAGS only: include restaurants with max_price_tag <= value."""
        q = Q(max_price_tag__isnull=False, max_price_tag__lte=value)
        return queryset.filter(q).distinct()

    def filter_price(self, queryset, name, value):
        """Use price TAGS only: include restaurants where min_price_tag <= value <= max_price_tag."""
        q_tags_range = Q(min_price_tag__isnull=False, max_price_tag__isnull=False) & Q(min_price_tag__lte=value) & Q(max_price_tag__gte=value)
        return queryset.filter(q_tags_range).distinct()

    class Meta:
        model = Restaurant
        fields = [
            'cuisines__name',
            'locations__name',
            'cuisine',
            'location',
            'cuisines',
            'locations',
            'menu_title',
            'menu_page',
            'min_price',
            'max_price',
            'price',
        ]

# 🏪 RestaurantViewSet — full CRUD with filtering, search, and ordering
class RestaurantViewSet(viewsets.ModelViewSet):
    """
    List, create, retrieve, update, delete restaurants.

    Supports:
      • ?cuisines__name=Thai&cuisines__name=Indian       → filter by multiple cuisines
      • ?locations__name=Durban&locations__name=Cape Town→ filter by multiple locations
      • ?menu_title=Lunch                                → filter by menu title
      • ?menu_page=2                                     → filter by menu page number
      • ?search=<term>                                   → search by restaurant name
      • ?ordering=<field>                                → order by name or other fields
    """
    queryset = (
        Restaurant.objects.all()
        .annotate(
            min_item_price=Min('menu_items__price'),
            max_item_price=Max('menu_items__price'),
            average_item_price=Avg('menu_items__price'),
        )
        .order_by('name')  # 🔧 Explicit ordering for consistent pagination
    )
    serializer_class = RestaurantSerializer
    permission_classes = [AllowAny]

    # ✅ Enable filtering, searching, and ordering
    filter_backends = [
        DjangoFilterBackend,     # → supports ?field=value filters
        filters.SearchFilter,    # → supports ?search=term
        filters.OrderingFilter,  # → supports ?ordering=name
    ]

    # ✅ Use custom filter class for multi-value and related model support
    filterset_class = RestaurantFilter

    # ✅ Search by restaurant name (and description)
    search_fields = ['name', 'description', 'cuisines__name', 'locations__name']

    # ✅ Allow ordering by name
    ordering_fields = ['name']

# 🏠 Home View — simple welcome message
def home(request):
    """
    Basic landing view for the API root.
    """
    return HttpResponse("Welcome to the Tasted API!")