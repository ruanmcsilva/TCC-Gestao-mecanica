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
from django_filters.rest_framework import DjangoFilterBackend
from datetime import datetime
from django.utils import timezone
from django.db.models import Sum, F, Q, DecimalField, Subquery
from django.db.models.functions import Coalesce
from rest_framework.decorators import api_view
from .services.fiscal_service import FiscalService
from .models import Servico
from django.db import transaction
try:
    import pandas as pd
except ImportError:
    pd = None
from .models import Servico, ItemServicoPeca
from .utils import formatar_zap_link
from datetime import timedelta






import os
from .models import (
    Fornecedor, GrupoPeca, Peca, Cliente, Moto, Servico, 
    ItemServicoPeca, MovimentacaoEstoque, FotoServico, Convite, Agendamento,
    NotaFiscalPendente
)
from .serializers import (
    FornecedorSerializer, GrupoPecaSerializer, PecaSerializer, ClienteSerializer, 
    MotoSerializer, ServicoSerializer, ItemServicoPecaSerializer, 
    MovimentacaoEstoqueSerializer, UserSerializer, FotoServicoSerializer,AgendamentoSerializer
)


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


class SolicitacaoAcessoView(APIView):
    """ Chamada pelo modal 'Criar Conta' no Login """
    permission_classes = [AllowAny]

    def post(self, request):
        email_cliente = request.data.get('email')
        if not email_cliente:
            return Response({"error": "E-mail é obrigatório"}, status=status.HTTP_400_BAD_REQUEST)

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
                fail_silently=True,
            )
        except Exception as e:
            print(f"Erro no email: {e}")
        
        return Response({"message": "Solicitação enviada com sucesso"}, status=status.HTTP_200_OK)

class AutorizarAcessoView(APIView):
    """ Chamada pelo ADM na tela de Solicitações """
    permission_classes = [IsAuthenticated, IsAdminUser]

    def post(self, request, pk):
        convite = get_object_or_404(Convite, pk=pk)
        
        nivel_acesso = request.data.get('nivel_acesso', 'funcionario')
        
        convite.autorizado = True
        convite.nivel_acesso = nivel_acesso
        convite.save()

        link_cadastro = f"http://localhost:5173/cadastro-token?token={convite.token}&email={convite.email}"

        try:
            send_mail(
                "Acesso Autorizado! - Gestão Mecânica",
                f"Olá! Seu acesso foi liberado como {nivel_acesso.capitalize()}.\nClique no link para criar sua conta:\n{link_cadastro}",
                settings.EMAIL_HOST_USER,
                [convite.email],
                fail_silently=True,
            )
        except Exception as e:
            print(f"Erro no email: {e}")
            
        return Response({"message": f"Convite autorizado como {nivel_acesso} com sucesso!"}, status=status.HTTP_200_OK)

class RegistrarComTokenView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get('token')
        nome = request.data.get('nome')
        senha = request.data.get('senha')
        confirmacao_senha = request.data.get('confirmacao_senha')

        if not token or not nome or not senha or not confirmacao_senha:
            return Response({"error": "Todos os campos são obrigatórios."}, status=status.HTTP_400_BAD_REQUEST)

        if senha != confirmacao_senha:
            return Response({"error": "As senhas não coincidem."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            convite = Convite.objects.get(token=token, autorizado=True)
        except Convite.DoesNotExist:
            return Response({"error": "Token inválido, não autorizado ou já utilizado."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=convite.email).exists():
            return Response({"error": "Já existe um usuário com este e-mail."}, status=status.HTTP_400_BAD_REQUEST)

        is_staff = (convite.nivel_acesso == 'admin')
        user = User.objects.create_user(
            username=convite.email,
            email=convite.email,
            password=senha,
            first_name=nome,
            is_active=True,
            is_staff=is_staff
        )

        convite.delete() 

        return Response({"message": "Conta criada com sucesso!"}, status=status.HTTP_201_CREATED)

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
        "criado_em": c.criado_em,
        "token": c.token
    } for c in convites]
    return Response(data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_sessao(request):
    return Response({'id': request.user.id, 'username': request.user.username, 'email': request.user.email})

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    mensagem = f"Seu código de recuperação é: {reset_password_token.key}"
    try:
        send_mail(
            subject="Recuperação de Senha - Gestão Mecânica",
            message=mensagem,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[reset_password_token.user.email],
            fail_silently=True
        )
    except Exception as e:
        print(f"Erro no envio do email de recuperação de senha: {e}")




class FornecedorViewSet(viewsets.ModelViewSet):
    queryset = Fornecedor.objects.all(); serializer_class = FornecedorSerializer; permission_classes = [IsAuthenticated]

class GrupoPecaViewSet(viewsets.ModelViewSet):
    queryset = GrupoPeca.objects.all(); serializer_class = GrupoPecaSerializer; permission_classes = [IsAuthenticated]

class PecaViewSet(viewsets.ModelViewSet):
    queryset = Peca.objects.all(); serializer_class = PecaSerializer; permission_classes = [IsAuthenticated]
    filter_backends = [filters.SearchFilter]; search_fields = ['nome']

class ClienteViewSet(viewsets.ModelViewSet):
    queryset = Cliente.objects.all()

    def get_queryset(self):
        if self.action == 'list':
            return Cliente.objects.exclude(nome="CONSUMIDOR PADRAO").order_by('-id')
        return Cliente.objects.all().order_by('-id')
    serializer_class = ClienteSerializer
    permission_classes = [IsAuthenticated]
    
    filter_backends = [filters.SearchFilter]
    search_fields = ['nome', 'cpf_cnpj', 'telefone']

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        
        instance = Cliente.objects.get(pk=response.data['id'])
        
        msg = (
            f"Olá *{instance.nome}*! 👋\n\n"
            f"Seja bem-vindo(a) à *Oficina do Ruan*. "
            f"Seu cadastro foi realizado com sucesso em nosso sistema!\n\n"
            f"Sempre que precisar de manutenção para sua moto, estamos à disposição. 🛠️🏍️"
        )
        
        if instance.telefone:
            response.data['whatsapp_link'] = formatar_zap_link(instance.telefone, msg)
        else:
            response.data['whatsapp_link'] = None
            
        return response

class MotoViewSet(viewsets.ModelViewSet):
    queryset = Moto.objects.all()
    serializer_class = MotoSerializer
    permission_classes = [IsAuthenticated]

    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['cliente']
    search_fields = ['modelo', 'placa', 'marca', 'cliente__nome']

class ItemServicoPecaViewSet(viewsets.ModelViewSet):
    queryset = ItemServicoPeca.objects.all()
    serializer_class = ItemServicoPecaSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = ItemServicoPeca.objects.all()
        servico_id = self.request.query_params.get('servico') 
        if servico_id is not None:
            queryset = queryset.filter(servico_id=servico_id)
        return queryset

class ServicoViewSet(viewsets.ModelViewSet):
    queryset = Servico.objects.all()
    serializer_class = ServicoSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Servico.objects.all()
        if self.request.query_params.get('exclude_balcao') == 'true':
            queryset = queryset.exclude(descricao__icontains='VENDA BALCÃO')
        return queryset
    
    def perform_create(self, serializer): 
        responsavel = serializer.validated_data.get('responsavel', self.request.user)
        serializer.save(responsavel=responsavel)
        
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status']
    ordering_fields = ['data_inicio', 'data_fim', 'id']
    ordering = ['-data_inicio']
    
    search_fields = ['descricao', 'moto__placa', 'cliente__nome', 'moto__modelo']


    @action(detail=True, methods=['get'])
    def imprimir_os(self, request, pk=None):
        servico = self.get_object()
        
        logo_path = os.path.join(settings.BASE_DIR, 'loja', 'templates', 'loja', 'logo.png')

        context = {
            'servico': servico, 
            'cliente': servico.cliente, 
            'moto': servico.moto, 
            'itens': servico.itens_servico_peca.all(),
            'logo_path': logo_path 
        }
        
        html_string = render_to_string('loja/os.html', context)
        pdf = HTML(string=html_string).write_pdf()
        
        response = HttpResponse(pdf, content_type='application/pdf')
        response['Content-Disposition'] = f'inline; filename="os_{servico.id}.pdf"'
        return response

class MovimentacaoEstoqueViewSet(viewsets.ModelViewSet):
    queryset = MovimentacaoEstoque.objects.all(); serializer_class = MovimentacaoEstoqueSerializer; permission_classes = [IsAuthenticated]

class FotoServicoViewSet(viewsets.ModelViewSet):
    queryset = FotoServico.objects.all()
    serializer_class = FotoServicoSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['servico']

class DeactivateAccountView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        user.is_active = False 
        user.save()
        return Response({"detail": "Conta desativada com sucesso."}, status=200)

from django.db.models import Sum, F, Q, DecimalField
from django.db.models.functions import Coalesce

@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def financial_report(request):
    mes_param = request.query_params.get('mes')
    ano_param = request.query_params.get('ano')
    periodo = request.query_params.get('periodo', 'mes')

    filtros = Q(status='CONCLUIDO')

    try:
        if periodo == 'mes':
            if not mes_param or not ano_param:
                return Response({"error": "Mês e Ano são obrigatórios para filtro mensal"}, status=400)
            filtros &= Q(data_fim__month=int(mes_param), data_fim__year=int(ano_param))
        
        elif periodo == '6meses':
            data_limite = timezone.now() - timedelta(days=180)
            filtros &= Q(data_fim__gte=data_limite)
        
        elif periodo == 'ano':
            if not ano_param:
                return Response({"error": "Ano é obrigatório para filtro anual"}, status=400)
            filtros &= Q(data_fim__year=int(ano_param))

        servicos = Servico.objects.filter(filtros)
        servicos_ids = servicos.values_list('id', flat=True)
    
        total_mao_de_obra = servicos.aggregate(
            total=Coalesce(Sum('valor_mao_de_obra'), 0, output_field=DecimalField())
        )['total']

        itens = ItemServicoPeca.objects.filter(servico_id__in=servicos_ids).select_related('peca')

        total_pecas_receita = 0
        total_custo_pecas = 0

        for item in itens:
            venda_unitario = item.valor_unitario_na_epoca or 0
            total_pecas_receita += (item.quantidade_utilizada * float(venda_unitario))
            
            if item.peca and item.peca.preco_custo:
                total_custo_pecas += (item.quantidade_utilizada * float(item.peca.preco_custo))

        receita_bruta = float(total_mao_de_obra) + float(total_pecas_receita)
        lucro_bruto = receita_bruta - float(total_custo_pecas)

        return Response({
            "periodo": periodo,
            "servicos_concluidos_count": servicos.count(),
            "total_mao_de_obra": float(total_mao_de_obra),
            "total_pecas_receita": float(total_pecas_receita),
            "total_custo_pecas": float(total_custo_pecas),
            "total_receita_bruta": receita_bruta,
            "total_lucro_bruto": lucro_bruto,
        })

    except Exception as e:
        print(f"--- ERRO RELATÓRIO FINANCEIRO ---")
        print(f"Tipo: {type(e).__name__}")
        print(f"Mensagem: {str(e)}")
        return Response({"error": "Erro interno ao processar dados."}, status=500)

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

@api_view(['GET'])
@permission_classes([AllowAny])
def consulta_api_externa(request, tipo, valor):
    import requests
    
    if tipo == 'placa':
        placa_limpa = str(valor).strip().upper().replace('-', '')
        url = f"https://brasilapi.com.br/api/fipe/veiculos/v1/{placa_limpa}"
        
        try:
            response = requests.get(url, timeout=4)
            if response.status_code == 200:
                data = response.json()
                veiculo = data[0] if isinstance(data, list) else data
                return Response({
                    "placa": placa_limpa,
                    "modelo": veiculo.get('modelo'),
                    "marca": veiculo.get('marca'),
                    "cor": "Preta (Base)",
                    "status": "API Real"
                }, status=200)
            
            raise Exception("Fallback necessário")

        except Exception:
            return Response({
                "placa": placa_limpa,
                "modelo": "Honda CG 160 Titan (Simulação)",
                "marca": "Honda",
                "cor": "Azul Metálico",
                "status": "Modo de Demonstração",
            }, status=200)

    valor_limpo = ''.join(filter(str.isdigit, str(valor)))

    if tipo == 'cep':
        url = f"https://brasilapi.com.br/api/cep/v1/{valor_limpo}"
        try:
            response = requests.get(url, timeout=5)
            return Response(response.json(), status=response.status_code)
        except:
            return Response({"error": "Erro ao consultar CEP"}, status=500)

    elif tipo == 'cpf':
        if len(valor_limpo) != 11 or valor_limpo == valor_limpo[0] * 11:
            return Response({"valido": False, "error": "CPF Inválido"}, status=400)
        for i in range(9, 11):
            soma = sum(int(valor_limpo[num]) * ((i + 1) - num) for num in range(i))
            digito = (soma * 10 % 11) % 10
            if digito != int(valor_limpo[i]):
                return Response({"valido": False, "error": "CPF Inválido"}, status=400)
        return Response({"valido": True, "mensagem": "CPF válido"}, status=200)

    elif tipo == 'cnpj':
        url = f"https://brasilapi.com.br/api/cnpj/v1/{valor_limpo}"
        try:
            response = requests.get(url, timeout=5)
            return Response(response.json(), status=response.status_code)
        except:
            return Response({"error": "Erro ao consultar CNPJ"}, status=500)

    return Response({"error": "Tipo inválido"}, status=400)

def imprimir_cupom_fiscal(request, venda_id):
    venda = Servico.objects.get(id=venda_id)
    itens = ItensServico.objects.filter(servico=venda)
    
    qr_code_url = f"https://chart.googleapis.com/chart?chs=150x150&cht=qr&chl=http://mecanicaspace.com/venda/{venda.id}"

    context = {
        'venda': venda,
        'itens': itens,
        'qr_code': qr_code_url,
        'empresa': {
            'nome': 'MECÂNICA SPACE',
            'cnpj': '00.000.000/0001-00',
            'endereco': 'Maceió, AL'
        }
    }
    
    html = render_to_string('cupom_fiscal_termico.html', context)
    return HttpResponse(html)

@api_view(['POST'])
@permission_classes([AllowAny])
def finalizar_venda_completa(request):
    dados = request.data
    venda_id = dados.get('venda_id')
    metodo = dados.get('pagamento', 'PIX')
    
    try:
        with transaction.atomic():
            if venda_id:
                venda = Servico.objects.select_for_update().get(id=venda_id)
            else:
                cliente_anonimo, _ = Cliente.objects.get_or_create(nome="CONSUMIDOR PADRAO")
                venda = Servico.objects.create(
                    cliente=cliente_anonimo,
                    status='PENDENTE',
                    descricao=f"VENDA BALCÃO - {metodo}",
                    kilometragem=0, valor_mao_de_obra=0
                )
                itens_balcao = dados.get('itens', [])
                for it in itens_balcao:
                    peca_obj = Peca.objects.get(id=it['codigo'])
                    ItemServicoPeca.objects.create(
                        servico=venda, peca=peca_obj,
                        quantidade_utilizada=it['quantidade'],
                        valor_unitario_na_epoca=it['valor_unitario']
                    )

            itens = ItemServicoPeca.objects.filter(servico=venda)
            for item in itens:
                p = item.peca
                if p.quantidade_em_estoque < item.quantidade_utilizada:
                    return Response({
                        "erro": f"Estoque insuficiente: {p.nome}"
                    }, status=400)
                
                p.quantidade_em_estoque = F('quantidade_em_estoque') - item.quantidade_utilizada
                p.save()
                
                MovimentacaoEstoque.objects.create(
                    peca=p, tipo_movimentacao='SAIDA',
                    quantidade=item.quantidade_utilizada,
                    servico_relacionado=venda, origem_destino="VENDA FINALIZADA"
                )

            venda.status = 'CONCLUIDO'
            venda.data_fim = timezone.now() 
            if venda_id:
                venda.descricao = f"{venda.descricao} | PAGO: {metodo}"
            venda.save() 
            # ------------------------------------------

        url_danfe = None
        try:
            fiscal = FiscalService()
            resultado_fiscal = fiscal.emitir_nfc_e(venda)
            url_danfe = resultado_fiscal.get('url_danfe') or resultado_fiscal.get('url')
        except Exception:
            url_danfe = "https://homologacao.focusnfe.com.br/danfe/exemplo"

        whatsapp_link = None
        if venda.cliente and venda.cliente.telefone:
            valor_total = venda.valor_total_servico
            moto_info = f" ({venda.moto.placa})" if venda.moto else ""
            modelo_info = venda.moto.modelo if venda.moto else "Sua moto"
            mensagem = (
                f"{modelo_info}{moto_info} está pronta! 🏍️💨\n\n"
                f"Olá *{venda.cliente.nome}*, finalizamos o serviço.\n"
                f"💰 *Valor Total:* R$ {valor_total:.2f}\n"
                f"Você pode visualizar sua Nota Fiscal aqui:\n{url_danfe}\n\n"
                f"Oficina do Ruan."
            )
            whatsapp_link = formatar_zap_link(venda.cliente.telefone, mensagem)

        return Response({
            "mensagem": "Venda finalizada com sucesso!",
            "status_final": "CONCLUIDO",
            "url_danfe": url_danfe,
            "whatsapp_link": whatsapp_link
        }, status=201)

    except Exception as e:
        return Response({"erro": str(e)}, status=500)
@api_view(['POST'])
@permission_classes([AllowAny])
def finalizar_venda_balcao_completa(request):
    return finalizar_venda_completa(request)

class DashboardAnaliticoView(APIView):
    permission_classes = [IsAuthenticated, IsAdminUser]

    def get(self, request):
        if pd is None:
            return Response(
                {"error": "Relatório analítico indisponível: dependência pandas não instalada no container."},
                status=503
            )

        periodo_selecionado = request.query_params.get('periodo', 'mes')
        
        servicos = Servico.objects.filter(status='CONCLUIDO').values(
            'id', 'data_fim', 'valor_mao_de_obra', 
            'responsavel__username', 'descricao'
        )
        
        if not servicos.exists():
            return Response({"error": "Nenhum dado encontrado"}, status=404)

        df_servicos = pd.DataFrame(list(servicos))
        df_servicos['data_fim'] = pd.to_datetime(df_servicos['data_fim'])
        df_servicos['valor_mao_de_obra'] = df_servicos['valor_mao_de_obra'].astype(float)

        itens = ItemServicoPeca.objects.filter(servico__status='CONCLUIDO').values(
            'servico_id', 'quantidade_utilizada', 'valor_unitario_na_epoca', 'peca__preco_custo'
        )
        
        df_itens = pd.DataFrame(list(itens))
        
        if not df_itens.empty:
            df_itens['total_venda_peca'] = df_itens['quantidade_utilizada'] * df_itens['valor_unitario_na_epoca'].astype(float)
            df_itens['total_custo_peca'] = df_itens['quantidade_utilizada'] * df_itens['peca__preco_custo'].astype(float)
            
            resumo_pecas = df_itens.groupby('servico_id').agg({
                'total_venda_peca': 'sum',
                'total_custo_peca': 'sum'
            }).reset_index()
        else:
            resumo_pecas = pd.DataFrame(columns=['servico_id', 'total_venda_peca', 'total_custo_peca'])

        df_final = pd.merge(df_servicos, resumo_pecas, left_on='id', right_on='servico_id', how='left')
        
        colunas_financeiras = ['total_venda_peca', 'total_custo_peca']
        df_final[colunas_financeiras] = df_final[colunas_financeiras].fillna(0)
        df_final['valor_total_calculado'] = df_final['valor_mao_de_obra'] + df_final['total_venda_peca']
        mapa = {
            'dia': 'D', 
            'quinzena': '15D', 
            'mes': 'ME', 
            'trimestral': 'QE', 
            '6meses': '6ME', 
            'ano': 'YE'
        }
        regra = mapa.get(periodo_selecionado, 'ME')
        df_final = df_final.set_index('data_fim')
        timeline = df_final.resample(regra).agg({
            'valor_mao_de_obra': 'sum',
            'total_venda_peca': 'sum',
            'total_custo_peca': 'sum',
            'valor_total_calculado': 'sum'
        }).reset_index()
        
        timeline['data_rotulo'] = timeline['data_fim'].dt.strftime('%d/%m/%y')
        produtividade = df_final.groupby('responsavel__username').agg({
            'valor_total_calculado': 'sum',
            'id': 'count'
        }).rename(columns={'id': 'qtd_os'}).reset_index()
        
        total_geral = df_final['valor_total_calculado'].sum()
        produtividade['percentual'] = (produtividade['valor_total_calculado'] / total_geral * 100).round(1) if total_geral > 0 else 0

        def extrair_pagamento(desc):
            desc_upper = str(desc).upper()
            for p in ['PIX', 'CARTÃO', 'DINHEIRO', 'DÉBITO']:
                if p in desc_upper: return p
            return 'OUTROS'
        
        df_final['metodo_pagto'] = df_final['descricao'].apply(extrair_pagamento)
        pagamentos = df_final.groupby('metodo_pagto')['valor_total_calculado'].sum().reset_index()

        return Response({
            "timeline": timeline.to_dict(orient='records'),
            "funcionarios": produtividade.to_dict(orient='records'),
            "pagamentos": pagamentos.to_dict(orient='records'),
            "kpis": {
                "faturamento_total": float(total_geral),
                "lucro_estimado": float(total_geral - df_final['total_custo_peca'].sum()),
                "ticket_medio": float(df_final['valor_total_calculado'].mean()) if not df_final.empty else 0
            }
        })
    


class AgendamentoViewSet(viewsets.ModelViewSet):
    queryset = Agendamento.objects.all()
    serializer_class = AgendamentoSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        data_agendamento = serializer.validated_data.get('data')
        if data_agendamento < timezone.now().date():
            raise serializers.ValidationError({"erro": "Não é possível agendar para uma data passada."})
        serializer.save()
    
    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        instance = Agendamento.objects.get(pk=response.data['id'])
        msg = (
            f"Olá *{instance.cliente.nome}*! 🏍️\n\n"
            f"Seu agendamento na oficina foi registrado:\n"
            f"📅 Data: {instance.data.strftime('%d/%m/%Y')}\n"
            f"⏰ Horário: {instance.hora.strftime('%H:%M')}\n"
            f"🛵 Moto: {instance.moto.modelo} ({instance.moto.placa})\n\n"
            f"Estamos te aguardando!"
        )
        response.data['whatsapp_link'] = formatar_zap_link(instance.cliente.telefone, msg)
        return response
    @action(detail=False, methods=['get'])
    def hoje(self, request):
        hoje = timezone.now().date()
        agendamentos = self.queryset.filter(data=hoje)
        serializer = self.get_serializer(agendamentos, many=True)
        return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def consultar_ai(request):
    pergunta = request.data.get('pergunta')
    
    if not pergunta:
        return Response({"error": "A pergunta é obrigatória."}, status=400)

    contexto = (
        "Você é o Space Expert, assistente técnico da oficina Space Motos, especializado em mecânica "
        "de motocicletas no Brasil. Responda sempre em português brasileiro, de forma direta e útil. "
        "Não comece se apresentando, não diga apenas que pode ajudar e não enrole. "
        "Se o usuário cumprimentar, responda com uma saudação curta. "
        "Se o usuário perguntar medida, peça, retentor, óleo, calibragem, defeito ou manutenção, "
        "responda primeiro a informação técnica mais provável. Depois diga que pode variar conforme "
        "ano, versão e peça instalada, e recomende confirmar no manual, etiqueta, peça antiga ou catálogo. "
        "Se não tiver certeza absoluta, diga 'o mais comum é' e explique como conferir. "
        "Não use Markdown, negrito ou listas longas; use frases curtas."
    )

    try:
        import requests
        import time

        if not settings.GEMINI_API_KEY:
            raise Exception("GEMINI_API_KEY não configurada.")

        prompt = f"{contexto}\n\nUsuário pergunta: {pergunta}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 900,
            },
        }

        modelos = [
            settings.GEMINI_MODEL,
            "gemini-2.5-flash",
            "gemini-2.5-flash-lite",
            "gemini-2.5-flash",
        ]
        ultimo_erro = None

        for nome_modelo in dict.fromkeys(modelos):
            url = (
                "https://generativelanguage.googleapis.com/v1beta/models/"
                f"{nome_modelo}:generateContent?key={settings.GEMINI_API_KEY}"
            )
            for tentativa in range(3):
                response = requests.post(url, json=payload, timeout=20)
                if response.status_code == 200:
                    data = response.json()
                    texto = (
                        data.get("candidates", [{}])[0]
                        .get("content", {})
                        .get("parts", [{}])[0]
                        .get("text", "")
                        .strip()
                    )
                    if texto:
                        return Response({"resposta": texto}, status=200)
                    ultimo_erro = f"{nome_modelo}: Gemini retornou resposta vazia."
                    break

                ultimo_erro = f"{nome_modelo}: HTTP {response.status_code}"

                if response.status_code in [400, 404, 429]:
                    break

                if response.status_code in [500, 502, 503, 504] and tentativa < 2:
                    time.sleep(1)
                    continue

                break

        raise Exception(ultimo_erro or "Nenhum modelo Gemini respondeu.")

    except Exception as e:
        print("\n" + "="*30)
        print(f"Erro ao consultar IA: {str(e)}")
        print("="*30 + "\n")
        return Response({"resposta": "Desculpe, o Space Expert está temporariamente indisponível. Por favor, tente novamente mais tarde."}, status=200)

class FuncionarioViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.filter(is_active=True)
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

import base64
import json

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_nf_view(request):
    import requests
    imagem_base64 = request.data.get('imagem')
    if not imagem_base64:
        return Response({"error": "Imagem não enviada"}, status=400)
    
    if imagem_base64.startswith('data:image'):
        imagem_base64 = imagem_base64.split(',')[1]

    contexto = (
        "Você é um extrator de dados de notas fiscais. "
        "Analise a imagem da nota fiscal e extraia os itens listados. "
        "Retorne APENAS um JSON estrito no formato: "
        '[{"nome_peca": "string", "valor_unitario": float, "quantidade": int}]. '
        "Não inclua markdown, crases ou qualquer outro texto. "
        "Se não conseguir ler, retorne []"
    )

    try:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.GEMINI_MODEL}:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{
                "parts": [
                    {"text": contexto},
                    {
                        "inline_data": {
                            "mime_type": "image/jpeg",
                            "data": imagem_base64
                        }
                    }
                ]
            }],
            "generationConfig": {"temperature": 0.1}
        }
        
        response = requests.post(url, json=payload, timeout=20)
        if response.status_code == 200:
            data = response.json()
            texto = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
            
            if texto.startswith("```json"):
                texto = texto[7:]
            if texto.startswith("```"):
                texto = texto[3:]
            if texto.endswith("```"):
                texto = texto[:-3]
            texto = texto.strip()

            dados_json = json.loads(texto)
            
            NotaFiscalPendente.objects.create(
                usuario=request.user,
                dados_extraidos=dados_json
            )
            return Response({"message": "Nota fiscal processada com sucesso. Acesse o computador para continuar."}, status=200)
        else:
            return Response({"error": "Erro ao processar imagem na IA", "details": response.text}, status=500)
    except Exception as e:
        return Response({"error": str(e)}, status=500)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def nf_pendentes_view(request):
    pendente = NotaFiscalPendente.objects.filter(usuario=request.user).order_by('-criado_em').first()
    if pendente:
        return Response({
            "id": pendente.id,
            "itens": pendente.dados_extraidos,
            "criado_em": pendente.criado_em
        }, status=200)
    return Response({"message": "Nenhuma nota pendente"}, status=404)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirmar_nf_view(request):
    pendente_id = request.data.get('pendente_id')
    itens_confirmados = request.data.get('itens')
    servico_id = request.data.get('servico_id')
    
    if not pendente_id or not itens_confirmados:
        return Response({"error": "Dados incompletos"}, status=400)
        
    try:
        pendente = NotaFiscalPendente.objects.get(id=pendente_id, usuario=request.user)
        
        servico = None
        if servico_id:
            from .models import Servico, ItemServicoPeca
            try:
                servico_id_int = int(servico_id)
                servico = Servico.objects.filter(id=servico_id_int).first()
                print(f"DEBUG: servico encontrado: {servico}")
            except Exception as e:
                print(f"DEBUG: erro ao converter servico_id ou buscar: {e}")
            
        for item in itens_confirmados:
            nome_peca = item.get('nome_peca', 'Peça Externa')
            if '(-- EXTERNA)' not in nome_peca:
                nome_peca = f"{nome_peca} (-- EXTERNA)"

            peca = Peca.objects.create(
                nome=nome_peca,
                preco_custo=item.get('valor_unitario', 0),
                preco_venda=item.get('preco_venda', 0),
                quantidade_em_estoque=0,
                origem_externa=True
            )
            
            if servico:
                try:
                    ItemServicoPeca.objects.create(
                        servico=servico,
                        peca=peca,
                        quantidade_utilizada=item.get('quantidade', 1),
                        valor_unitario_na_epoca=item.get('preco_venda', 0)
                    )
                    print(f"DEBUG: ItemServicoPeca criado com sucesso")
                except Exception as e:
                    print(f"DEBUG: erro ao criar ItemServicoPeca: {e}")
                
        pendente.delete()
        return Response({"message": "Peças cadastradas com sucesso"}, status=201)
    except NotaFiscalPendente.DoesNotExist:
        return Response({"error": "Nota pendente não encontrada"}, status=404)
    except Exception as e:
        print(f"DEBUG: erro geral: {e}")
        return Response({"error": str(e)}, status=500)

