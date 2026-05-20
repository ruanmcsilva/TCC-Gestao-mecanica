# loja/serializers.py
from rest_framework import serializers
from .models import Fornecedor, GrupoPeca, Peca, Cliente, Moto, Servico, ItemServicoPeca, MovimentacaoEstoque, FotoServico, Agendamento
from django.contrib.auth.models import User


class FornecedorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fornecedor
        fields = '__all__'


class GrupoPecaSerializer(serializers.ModelSerializer):
    class Meta:
        model = GrupoPeca
        fields = '__all__'

class PecaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Peca
        fields = '__all__'

class ClienteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cliente
        fields = '__all__'


class MotoSerializer(serializers.ModelSerializer):
    # Isso faz o Django enviar o nome do cliente em vez do ID
    cliente_nome = serializers.ReadOnlyField(source='cliente.nome') 

    class Meta:
        model = Moto
        fields = ['id', 'placa', 'modelo', 'ano', 'cliente_nome', 'cliente']


class ItemServicoPecaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemServicoPeca
        fields = ['id', 'servico', 'peca', 'quantidade_utilizada', 'valor_unitario_na_epoca']

class FotoServicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoServico
        fields = ['id', 'foto', 'descricao', 'data_upload','servico','data_upload']
        read_only_fields = ['data_upload']



class ServicoSerializer(serializers.ModelSerializer):
    itens_servico_peca = ItemServicoPecaSerializer(many=True, read_only=True)
    fotos = FotoServicoSerializer(many=True, read_only=True)
    cliente_nome = serializers.CharField(source='cliente.nome', read_only=True)
    responsavel_nome = serializers.CharField(source='responsavel.username', read_only=True)
    moto_placa = serializers.CharField(source='moto.placa', read_only=True)
    moto_modelo = serializers.CharField(source='moto.modelo', read_only=True)

    class Meta:
        model = Servico
        fields = [
            'id', 'cliente','cliente_nome', 'moto', 'moto_placa', 'moto_modelo', 'descricao', 'data_inicio', 'data_fim',
            'status', 'valor_mao_de_obra', 'observacoes', 'responsavel','responsavel_nome',
            'kilometragem', 'valor_total_pecas', 'valor_total_servico', 'itens_servico_peca', 'fotos'
        ]
        read_only_fields = ['data_inicio', 'valor_total_pecas', 'valor_total_servico', 'responsavel']


class MovimentacaoEstoqueSerializer(serializers.ModelSerializer):
    class Meta:
        model = MovimentacaoEstoque
        fields = '__all__'
        read_only_fields = ['data_movimentacao']


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user
    
#Agendamento
class AgendamentoSerializer(serializers.ModelSerializer):
    cliente_nome = serializers.ReadOnlyField(source='cliente.nome')
    moto_modelo = serializers.ReadOnlyField(source='moto.modelo')
    moto_placa = serializers.ReadOnlyField(source='moto.placa')

    class Meta:
        model = Agendamento
        fields = '__all__'

class CustomUserDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('pk', 'username', 'email', 'first_name', 'last_name', 'is_staff', 'is_superuser')
        read_only_fields = ('email', 'is_staff', 'is_superuser')