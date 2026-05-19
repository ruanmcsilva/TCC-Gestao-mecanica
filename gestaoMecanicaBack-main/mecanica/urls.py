# mecanica/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenRefreshView

# IMPORTANTE: Importar o arquivo de views onde você criou a função da nota
from loja import views 

from loja.views import SolicitacaoAcessoView, DeactivateAccountView

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # URL da sua app 'loja'
    path('api/v1/', include('loja.urls')),
    
    # Renovação de Token
    path('api/v1/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/v1/auth/', include('dj_rest_auth.urls')),
    path('api/v1/auth/user/deactivate/', DeactivateAccountView.as_view(), name='deactivate-user'),
    
    # RECURSO DE SENHA
    path('api/v1/password_reset/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('api/v1/solicitar-acesso/', SolicitacaoAcessoView.as_view(), name='solicitar-acesso'),
    
    # ROTA DA NOTA FISCAL (Corrigida para usar o views. que importamos acima)
    path('api/v1/vendas/emitir-nota/', views.finalizar_venda_completa),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)