# mecanica/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView
from loja.views import SolicitacaoAcessoView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URL da sua app 'loja' - Tudo que começa com api/v1/ vai para o outro arquivo
    path('api/v1/', include('loja.urls')),
    
    # Renovação de Token
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # RECURSO DE SENHA: Rota padrão para o reset de senha
    path('api/v1/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('api/v1/solicitar-acesso/', SolicitacaoAcessoView.as_view(), name='solicitar-acesso'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)