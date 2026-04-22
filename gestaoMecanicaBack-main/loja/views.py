from rest_framework import viewsets, status, filters
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.template.loader import render_to_string
from weasyprint import HTML
from django.shortcuts import get_object_or_404
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from rest_framework.views import APIView

from .models import (
    Fornecedor, GrupoPeca, Peca, Cliente, Moto, Servico, 
    ItemServicoPeca, MovimentacaoEstoque, FotoServico, Convite
)
from .serializers import (
    FornecedorSerializer, GrupoPecaSerializer, PecaSerializer, ClienteSerializer, 
    MotoSerializer, ServicoSerializer, ItemServicoPecaSerializer, 
    MovimentacaoEstoqueSerializer, UserSerializer, FotoServicoSerializer
)

# --- Autenticação e Registro ---

class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class RegisterView(viewsets.ViewSet):
    permission_classes = [AllowAny]
    serializer_class = UserSerializer

    def create(self, request):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        token_serializer = TokenObtainPairSerializer(data={
            'username': user.username, 
            'password': request.data['password']
        })
        token_serializer.is_valid(raise_exception=True)
        
        return Response({
            "user": UserSerializer(user).data,
            "message": "Usuário registrado com sucesso.",
            "token": token_serializer.validated_data
        }, status=status.HTTP_201_CREATED)

# --- Fluxo de Convites e Solicitações ---

class SolicitacaoAcessoView(APIView):
    """ Chamada pelo modal 'Criar Conta' no Login """
    permission_classes = [AllowAny]

    def post(self, request):
        email_cliente = request.data.get('email')
        if not email_cliente:
            return Response({"error": "E-mail é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

        # Salva o convite como pendente no banco
        convite, created = Convite.objects.get_or_create(email=email_cliente)

        assunto = f"Solicitação de Acesso: {email_cliente}"
        mensagem = (
            f"Olá Administrador,\n\n"
            f"O usuário {email_cliente} solicitou a criação de uma conta no sistema Gestão Mecânica.\n\n"
            f"Acesse o painel para liberar o acesso."
        )
        
        try:
            send_mail(
                subject=assunto,
                message=mensagem,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=['ruanmcs2@gmail.com'],
                fail_silently=False,
            )
            return Response({"message": "Solicitação enviada com sucesso"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Falha ao enviar e-mail informativo"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class AutorizarAcessoView(APIView):
    """ Chamada pelo ADM na tela de Solicitações """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        convite = get_object_or_404(Convite, pk=pk)
        convite.autorizado = True
        convite.save()

        link_cadastro = f"http://localhost:5173/finalizar-cadastro?token={convite.token}&email={convite.email}"

        try:
            send_mail(
                "Acesso Autorizado! - Gestão Mecânica",
                f"Olá! Seu acesso foi liberado. Clique no link para criar sua conta: {link_cadastro}",
                settings.EMAIL_HOST_USER,
                [convite.email],
                fail_silently=False,
            )
            return Response({"message": "Convite enviado com sucesso!"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": "Erro ao enviar e-mail de autorização"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAdminUser])
def contar_convites_pendentes(request):
    """ Alimenta o badge (exclamação) no Header do Layout """
    quantidade = Convite.objects.filter(autorizado=False).count()
    return Response({"pendentes": quantidade})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def listar_convites(request):
    """ Alimenta a tabela na tela de Solicitações """
    convites = Convite.objects.all().order_by('-criado_em')
    data = [{
        "id": c.id, 
        "email": c.email, 
        "autorizado": c.autorizado, 
        "criado_em": c.criado_em
    } for c in convites]
    return Response(data)

# --- Utilitários e Sessão ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sessao(request):
    return Response({'id': request.user.id, 'username': request.user.username, 'email': request.user.email})

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    mensagem = f"Seu código de recuperação é: {reset_password_token.key}"
    send_mail(
        subject="Recuperação de Senha - Gestão Mecânica",
        message=mensagem,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[reset_password_token.user.email]
    )

# --- ViewSets para CRUD ---

class StandardPagination(PageNumberPagination):
    page_size = 10

class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all(); serializer_class = FornecedorSerializer; permission_classes = [IsAuthenticated]

class GrupoPecaViewSet(viewsets.ModelViewSet):
    queryset = GrupoPeca.objects.all(); serializer_class = GrupoPecaSerializer; permission_classes = [IsAuthenticated]

class PecaViewSet(viewsets.ModelViewSet):
    queryset = Peca.objects.all(); serializer_class = PecaSerializer; permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]; search_fields = ['nome']

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all(); serializer_class = ClienteSerializer; permission_classes = [IsAuthenticated]

class MotoViewSet(viewsets.ModelViewSet):
    queryset = Moto.objects.all(); serializer_class = MotoSerializer; permission_classes = [IsAuthenticated]

class ItemServicoPecaViewSet(viewsets.ModelViewSet):
    queryset = ItemServicoPeca.objects.all(); serializer_class = ItemServicoPecaSerializer; permission_classes = [IsAuthenticated]

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all(); serializer_class = ServicoSerializer; permission_classes = [IsAuthenticated]
    def perform_create(self, serializer): serializer.save(responsavel=self.request.user)

    @action(detail=True, methods=['get'])
    def imprimir_os(self, request, pk=None):
        servico = self.get_object()
        context = {'servico': servico, 'cliente': servico.cliente, 'moto': servico.moto, 'itens': servico.itens_servico_peca.all()}
        html_string = render_to_string('loja/os.html', context)
        pdf = HTML(string=html_string, base_url=request.build_absolute_uri()).write_pdf()
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="os_{servico.id}.pdf"'
        return response

class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.all(); serializer_class = MovimentacaoEstoqueSerializer; permission_classes = [IsAuthenticated]

class FotoServicoViewSet(viewsets.ModelViewSet):
    queryset = FotoServico.objects.all(); serializer_class = FotoServicoSerializer; permission_classes = [IsAuthenticated]

# --- Relatórios ---

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def financial_report(request):
    return Response({"message": "Relatório Financeiro Gerado"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def services_in_progress_count(request):
    count = Servico.objects.filter(status='EM_ANDAMENTO').count()
    return Response({"count": count})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_parts_count(request):
    count = Peca.objects.filter(quantidade_em_estoque__lte=5).count()
    return Response({"count": count})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def client_history(request, pk=None):
    cliente = get_object_or_404(Cliente, pk=pk)
    servicos = Servico.objects.filter(cliente=cliente).order_by('-data_inicio')
    serializer = ServicoSerializer(servicos, many=True)
    return Response(serializer.data)

@require_http_methods(["GET"])
def consulta_api_externa(request, tipo, valor):
    return JsonResponse({'sucesso': True, 'dados': {}, 'aviso': 'Simulado'})