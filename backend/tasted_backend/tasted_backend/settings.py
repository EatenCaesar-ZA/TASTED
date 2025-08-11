"""
Settings — Django config for the Tasted backend.

Includes:
- CORS (django-cors-headers)
- DRF defaults (filtering, pagination, search, ordering)
- Simple JWT auth
- Swagger docs (drf-yasg)
- Media files in development

Hybrid-friendly:
- Keep host/ports configurable via env vars when preparing mobile builds
"""

from pathlib import Path

# ───────────────────────────────────── Path Setup ─────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent.parent

# ───────────────────────────────────── Security ─────────────────────────────────────
SECRET_KEY = 'django-insecure-0iv1!*7zn!#@rwx0a^+6aev$4#$w)hn-f)9&fl!qfpcm@w@@mt'
DEBUG = True
ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

# ───────────────────────────────────── Applications ─────────────────────────────────────
INSTALLED_APPS = [
    # Django built-ins
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party
    'corsheaders',               # CORS support
    'rest_framework',            # Django REST framework
    'django_filters',            # Declarative filtering
    'drf_yasg',                  # Swagger / OpenAPI docs
    'rest_framework_simplejwt',  # JWT authentication

    # Your apps
    'restaurantlist',            # Core restaurant app
]

# ───────────────────────────────────── Middleware ─────────────────────────────────────
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',            # Must come before CommonMiddleware
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'tasted_backend.urls'

# ───────────────────────────────────── Templates ─────────────────────────────────────
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',  # expose request in templates
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'tasted_backend.wsgi.application'

# ───────────────────────────────────── Database ─────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# ───────────────────────────────────── Password Validation ─────────────────────────────────────
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# ───────────────────────────────────── Internationalization ─────────────────────────────────────
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# ───────────────────────────────────── Static & Media ─────────────────────────────────────
STATIC_URL = '/static/'

# Media files (images uploaded via the API)  
MEDIA_URL = '/media/'  
MEDIA_ROOT = BASE_DIR / 'media'

# ───────────────────────────────────── CORS ─────────────────────────────────────
# Allow your React frontend to make requests
# In dev, allow the Vite dev server (default 5173) and common localhost variants
CORS_ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://127.0.0.1:5173',
]

# ───────────────────────────────────── DRF Configuration ─────────────────────────────────────
REST_FRAMEWORK = {
    # Use JWT for authentication
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    # Require authentication by default (override per-view if needed)
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),

    # Enable filtering, search, and ordering globally
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],

    # Pagination defaults
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
}

# ───────────────────────────────────── Default Primary Key ─────────────────────────────────────
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'