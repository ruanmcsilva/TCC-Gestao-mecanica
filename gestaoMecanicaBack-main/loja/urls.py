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
    RegistrarComTokenView, consultar_ai, FuncionarioViewSet,
    upload_nf_view, nf_pendentes_view, confirmar_nf_view
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
router.register(r'funcionarios', FuncionarioViewSet, basename='funcionarios')

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
    path('dashboard-analitico/', DashboardAnaliticoView.as_view(), name='dashboard-analitico'),
  
    path('ai/consultar/', consultar_ai, name='consultar_ai'),
    path('pecas/upload-nf/', upload_nf_view, name='upload_nf'),
    path('pecas/nf-pendentes/', nf_pendentes_view, name='nf_pendentes'),
    path('pecas/confirmar-nf/', confirmar_nf_view, name='confirmar_nf'),
    path('', include(router.urls)),
]