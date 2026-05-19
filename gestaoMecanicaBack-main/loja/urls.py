# loja/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    FornecedorViewSet, GrupoPecaViewSet, PecaViewSet, ClienteViewSet, MotoViewSet,
    ItemServicoPecaViewSet, ServicoViewSet, MovimentacaoEstoqueViewSet,
    CustomTokenObtainPairView, RegisterView, FotoServicoViewSet, 
    get_sessao, financial_report, services_in_progress_count, 
    low_stock_parts_count, client_history, consulta_api_externa,
    contar_convites_pendentes, SolicitacaoAcessoView,
    AutorizarAcessoView, listar_convites, DashboardAnaliticoView, AgendamentoViewSet,
    RegistrarComTokenView, consultar_ai
)

router = DefaultRouter()
router.register(r'fornecedores', FornecedorViewSet)
router.register(r'grupos', GrupoPecaViewSet)
router.register(r'pecas', PecaViewSet)
router.register(r'clientes', ClienteViewSet)
router.register(r'motos', MotoViewSet)
router.register(r'servicos', ServicoViewSet)
router.register(r'itens-servico', ItemServicoPecaViewSet)
router.register(r'movimentacoes', MovimentacaoEstoqueViewSet)
router.register(r'fotos', FotoServicoViewSet)
router.register(r'agendamento', AgendamentoViewSet)

urlpatterns = [
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('register/', RegisterView.as_view({'post': 'create'}), name='auth_register'),
    path('registrar-com-token/', RegistrarComTokenView.as_view(), name='registrar-com-token'),
    path('sessao/', get_sessao, name='sessao'),
    
    path('relatorio-financeiro/', financial_report, name='financial_report'),
    path('dashboard/services-in-progress/', services_in_progress_count, name='services_in_progress_count'),
    path('dashboard/low-stock-parts/', low_stock_parts_count, name='low_stock_parts_count'),
    
    path('clientes/<int:pk>/historico/', client_history, name='client_history'),
    path('consulta/<str:tipo>/<str:valor>/', consulta_api_externa, name='consulta_externa'),
    
    path('convites/pendentes/contagem/', contar_convites_pendentes),
    path('convites/lista/', listar_convites, name='listar-convites'),
    path('autorizar-acesso/<int:pk>/', AutorizarAcessoView.as_view(), name='autorizar-acesso'),
    path('solicitar-acesso/', SolicitacaoAcessoView.as_view(), name='solicitar-acesso'),
    
    # ROTA PARA O DASHBOARD COM PANDAS
    path('dashboard-analitico/', DashboardAnaliticoView.as_view(), name='dashboard-analitico'),
    
    # O include(router.urls) deve ficar aqui para carregar as rotas automáticas
    path('ai/consultar/', consultar_ai, name='consultar_ai'),
    path('', include(router.urls)),
]