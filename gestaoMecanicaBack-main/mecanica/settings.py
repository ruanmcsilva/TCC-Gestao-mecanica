from pathlib import Path
from datetime import timedelta
import os
FOCUSNFE_TOKEN = os.getenv("FOCUSNFE_TOKEN", "token_de_teste_caso_nao_haja_env")

BASE_DIR = Path(__file__).resolve().parent.parent
SECRET_KEY = 'django-insecure-2^(71(0r_+fkji1u7=x0dgke+dejhsu(^4z2%h6n7a3@5sxlum'
DEBUG = True
ALLOWED_HOSTS = ['192.168.0.123', 'localhost', '127.0.0.1']
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "AIzaSyAdxY2aZeGqVjJTzp8jeYjG7YfEKx8kPBU")
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

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'gestao_mecanica',
        'USER': 'admin',
        'PASSWORD': 'admin', 
        'HOST': 'db',            
        'PORT': '5432',
    }
}

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

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://192.168.0.123:5173", 
]
CSRF_TRUSTED_ORIGINS = [
    "http://192.168.0.123",
    "http://localhost:8000",
]

STATIC_URL = '/static/'
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuração DRF e JWT
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 10,
    'PAGE_SIZE_QUERY_PARAM': 'page_size',
    'MAX_PAGE_SIZE': 1000,
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
EMAIL_HOST_USER = 'ruanmcs2@gmail.com'
EMAIL_HOST_PASSWORD = 'qqvrnqqxbjprunyy' 
DEFAULT_FROM_EMAIL = 'Space Motos <ruanmcs2@gmail.com>'
EMAIL_TIMEOUT = 10  
FOCUSNFE_TOKEN = os.getenv("FOCUSNFE_TOKEN", "coloque_aqui_seu_token_de_homologacao")
FOCUSNFE_AMBIENTE = "homologacao"  


EMPRESA_FISCAL = {
    "cnpj": "00000000000100",          # CNPJ real ou de teste
    "inscricao_estadual": "00000000",  # IE de Alagoas
    "nome_fantasia": "Mecânica Space",
    "razao_social": "Ruan Gestao Automotiva LTDA",
    "regime_tributario": 1,            # 1 para Simples Nacional (comum em oficinas)
    "endereco": {
        "logradouro": "Avenida Principal",
        "numero": "123",
        "bairro": "Antares",
        "municipio": "Maceio",
        "uf": "AL",
        "cep": "57000000"
    }
}
