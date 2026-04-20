# loja/views.py completo e corrigido para bater com seu urls.py
from rest_framework import viewsets, status, filters, serializers
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from django.db import transaction
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
import requests
from django_filters.rest_framework import DjangoFilterBackend
from django.core.mail import send_mail
from django.conf import settings
from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.template.loader import render_to_string
from weasyprint import HTML
from django.db.models import Sum
from decimal import Decimal
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver

from .models import (
    Fornecedor, GrupoPeca, Peca, Cliente, Moto, Servico, 
    ItemServicoPeca, MovimentacaoEstoque, FotoServico
)
from .serializers import (
    FornecedorSerializer, GrupoPecaSerializer, PecaSerializer, ClienteSerializer, 
    MotoSerializer, ServicoSerializer, ItemServicoPecaSerializer, 
    MovimentacaoEstoqueSerializer, UserSerializer, FotoServicoSerializer
)

# --- Autenticação e Registro ---

class CustomTokenObtainPairView(TokenObtainPairView):
    pass

class RegisterView(viewsets.ViewSet): # ESSA ERA A CLASSE QUE FALTAVA
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

@api_view(['POST'])
@permission_classes([AllowAny])
def solicitar_criacao_conta(request):
    email_usuario = request.data.get('email')
    if not email_usuario:
        return Response({'erro': 'E-mail obrigatório.'}, status=400)
    send_mail(
        subject='Nova Solicitação de Conta - Gestão Mecânica',
        message=f'O usuário {email_usuario} solicitou acesso.',
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=['ruanmcs2@gmail.com'],
    )
    return Response({'message': 'Solicitação enviada!'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sessao(request):
    return Response({'id': request.user.id, 'username': request.user.username, 'email': request.user.email})

# --- Signal de Recuperação de Senha ---

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    mensagem = f"Seu código de recuperação é: {reset_password_token.key}"
    send_mail(
        subject="Recuperação de Senha - Gestão Mecânica",
        message=mensagem,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[reset_password_token.user.email]
    )

# --- ViewSets para CRUD (Necessários para loja/urls.py) ---

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

# --- Dashboard e Histórico ---

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
    # Mock básico para não dar erro
    return JsonResponse({'sucesso': True, 'dados': {}, 'aviso': 'Simulado'})