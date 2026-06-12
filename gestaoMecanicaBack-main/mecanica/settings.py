from pathlib import Path
from datetime import timedelta
import os
FOCUSNFE_TOKEN = os.getenv("FOCUSNFE_TOKEN", "token_de_teste_caso_nao_haja_env")

BASE_DIR = Path(__file__).resolve().parent.parent

# Security Settings
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-dev-key')
DEBUG = os.getenv('DJANGO_DEBUG', 'False') == 'True'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', '192.168.0.123,localhost,127.0.0.1').split(',')

# Gemini Config
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'loja',
    'rest_framework',
    'drf_yasg',
    'corsheaders',
    'django_filters',
    'rest_framework_simplejwt',
    'django_rest_passwordreset',
    'rest_framework.authtoken',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'mecanica.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'mecanica.wsgi.application'

import dj_database_url

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('POSTGRES_DB', 'gestao_mecanica'),
        'USER': os.getenv('POSTGRES_USER', 'admin'),
        'PASSWORD': os.getenv('POSTGRES_PASSWORD', 'admin'), 
        'HOST': os.getenv('POSTGRES_HOST', 'db'),            
        'PORT': os.getenv('POSTGRES_PORT', '5432'),
    }
}

# Se a variável DATABASE_URL existir (como no Render), sobrescreve as configs acima
if os.getenv('DATABASE_URL'):
    DATABASES['default'] = dj_database_url.config(default=os.getenv('DATABASE_URL'), conn_max_age=600)

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]


LANGUAGE_CODE = 'pt-br' 
TIME_ZONE = 'America/Maceio'
USE_I18N = True
USE_TZ = True

CORS_ALLOWED_ORIGINS = os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173,http://192.168.0.123:5173').split(',')
CSRF_TRUSTED_ORIGINS = os.getenv('CSRF_TRUSTED_ORIGINS', 'http://192.168.0.123,http://localhost:8000').split(',')

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuração DRF e JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'loja.pagination.StandardPagination',
    'PAGE_SIZE': 10,
}

REST_AUTH = {
    'USER_DETAILS_SERIALIZER': 'loja.serializers.CustomUserDetailsSerializer',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': False,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
}


MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = 'smtp.gmail.com'
EMAIL_PORT = 587
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', '') 
DEFAULT_FROM_EMAIL = f"Space Motos <{EMAIL_HOST_USER}>"
EMAIL_TIMEOUT = 10  
FOCUSNFE_TOKEN = os.getenv("FOCUSNFE_TOKEN")
FOCUSNFE_AMBIENTE = os.getenv("FOCUSNFE_AMBIENTE", "homologacao")  


EMPRESA_FISCAL = {
    "cnpj": "00000000000100",         
    "inscricao_estadual": "00000000",  
    "nome_fantasia": "Mecânica Space",
    "razao_social": "Ruan Gestao Automotiva LTDA",
    "regime_tributario": 1,
    "endereco": {
        "logradouro": "Avenida Principal",
        "numero": "123",
        "bairro": "Antares",
        "municipio": "Maceio",
        "uf": "AL",
        "cep": "57000000"
    }
}
