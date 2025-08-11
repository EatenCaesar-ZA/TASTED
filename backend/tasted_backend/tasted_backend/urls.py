"""
Project URLs — Root URL configuration for the Tasted backend.

Mounts the app API under /api/v1/ and serves MEDIA in development.
"""
from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf.urls.static import static
from django.conf import settings



# 🩺 Lightweight health check or welcome view
def api_home(request):
    return JsonResponse({
        'status': 'ok',
        'message': 'Welcome to the Tasted API',
        'version': 'v1',
        'endpoints': [
            '/api/v1/restaurants/',
            '/api/v1/menus/',
            # Future: '/api/v1/reviews/', '/api/v1/users/', etc.
        ]
    })

urlpatterns = [
    # 🔐 Admin panel
    path('admin/', admin.site.urls),

    # 🍽️ Restaurant-related API (v1)
    path('api/v1/', include(('restaurantlist.urls', 'restaurantlist'), namespace='restaurantlist')),
    

    # 🏠 Root route for health check or frontend landing
    path('', api_home, name='home'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

