import os
import django
import random
import string
import re
from datetime import timedelta
from decimal import Decimal
from faker import Faker
from django.db import transaction
from django.utils import timezone

# =========================================================
# CONFIG DJANGO
# =========================================================

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "mecanica.settings")
django.setup()

from loja.models import (
    Cliente,
    Moto,
    Servico,
    Fornecedor,
    Peca,
    GrupoPeca,
    ItemServicoPeca,
)

from django.contrib.auth.models import User

fake = Faker("pt_BR")

# =========================================================
# CONFIGURAÇÕES
# =========================================================

TOTAL_CLIENTES = 50
TOTAL_PECAS = 120
TOTAL_SERVICOS = 150

# =========================================================
# DADOS REAIS (MANTIDOS 100%)
# =========================================================

MARCAS_MODELOS = {
    "Honda": ["CG 160 Titan", "Fan 160", "Biz 125", "XRE 300", "CB 500X", "Hornet 600", "Pop 110"],
    "Yamaha": ["Fazer 250", "Factor 150", "Lander 250", "MT-03", "MT-07", "R3"],
    "Suzuki": ["Yes 125", "Intruder 125", "V-Strom 650", "GSX-S750"],
    "BMW": ["G 310 GS", "F 850 GS", "R 1250 GS"],
    "Kawasaki": ["Ninja 400", "Z400", "Versys 650"],
}

DESCRICOES_SERVICOS = [
    "Troca de óleo e filtro", "Revisão completa", "Troca kit transmissão",
    "Troca relação", "Troca pastilhas de freio", "Limpeza sistema injeção",
    "Troca pneu traseiro", "Troca pneu dianteiro", "Alinhamento de guidão",
    "Regulagem válvulas", "Troca embreagem", "Diagnóstico eletrônico",
    "Troca bateria", "Revisão suspensão",
]

OBSERVACOES_MOTO = [
    "Moto em excelente estado",
    "Arranhão no tanque lateral direito",
    "Pneu traseiro com desgaste irregular",
    "Necessita revisão geral na próxima visita",
    "Cliente relatou barulho leve no motor",
    "Pisca esquerdo trincado",
    "Pintura original, sem detalhes",
    "Carenagem com leves marcas de uso",
    "Corrente um pouco frouxa no momento da entrada",
    "Bateria trocada recentemente pelo cliente",
]

OBSERVACOES_SERVICO = [
    "Cliente aprovou o orçamento completo.",
    "Peça paralela de alta qualidade instalada conforme solicitação do cliente.",
    "Aguardando chegada de peça original para finalizar um detalhe estético.",
    "Recomendada a troca da relação na próxima revisão (aprox 3000km).",
    "Serviço realizado com sucesso. Teste de rodagem aprovado.",
    "Filtro de ar estava muito sujo, foi trocado e sistema limpo.",
    "Lavagem cortesia realizada após o serviço.",
    "Moto entregue antes do prazo previsto.",
]

STATUS_SERVICO = ["PENDENTE", "EM_ANDAMENTO", "CONCLUIDO", "CANCELADO"]

GRUPOS_PECAS = ["Freios", "Motor", "Suspensão", "Elétrica", "Transmissão", "Lubrificantes", "Pneus"]

FORNECEDORES = [
    {"nome": "Distribuidora Nordeste Peças", "email": "contato@nordestepecas.com.br", "telefone": "82999998888"},
    {"nome": "Moto Parts Brasil", "email": "vendas@motoparts.com.br", "telefone": "11988887777"},
    {"nome": "Alagoas Moto Center", "email": "financeiro@amc.com.br", "telefone": "82991112222"},
]

PECAS_REAIS = [
    "Filtro de óleo", "Pastilha de freio", "Kit transmissão", "Pneu traseiro",
    "Pneu dianteiro", "Velas de ignição", "Bateria 12v", "Óleo 10W30",
    "Disco de freio", "Amortecedor", "Manete embreagem", "Cabo acelerador", "Retentor bengala",
]

# =========================================================
# FUNÇÕES AUXILIARES
# =========================================================

def limpar_texto(texto):
    return re.sub(r"[\n\r\t]", " ", texto).strip()

def gerar_telefone():
    return f"829{random.randint(10000000, 99999999)}"

def gerar_placa():
    letras = ''.join(random.choices(string.ascii_uppercase, k=3))
    numeros = random.randint(1000, 9999)
    return f"{letras}{numeros}"

def gerar_codigo_peca():
    return f"SN-{random.randint(100000,999999)}-{random.choice(string.ascii_uppercase)}"

# =========================================================
# POPULAR BANCO
# =========================================================

@transaction.atomic
def popular_banco():
    print("🧹 Limpando banco...")
    ItemServicoPeca.objects.all().delete()
    Servico.objects.all().delete()
    Moto.objects.all().delete()
    Peca.objects.all().delete()
    Cliente.objects.all().delete()
    Fornecedor.objects.all().delete()
    GrupoPeca.objects.all().delete()

    user = User.objects.filter(is_superuser=True).first()
    if not user:
        print("❌ Crie um superusuário primeiro!")
        return

    # CRIAR GRUPOS
    grupos = [GrupoPeca.objects.create(nome=nome, descricao=f"Grupo focado em peças de {nome.lower()} para motocicletas de diversas cilindradas.") for nome in GRUPOS_PECAS]

    # CRIAR FORNECEDORES
    fornecedores = [Fornecedor.objects.create(**f) for f in FORNECEDORES]

    # CRIAR CLIENTES E MOTOS
    clientes_criados = []
    motos_criadas = []
    for _ in range(TOTAL_CLIENTES):
        cliente = Cliente.objects.create(
            nome=fake.name(),
            telefone=gerar_telefone(),
            email=fake.unique.email(),
            cpf_cnpj=fake.unique.cpf(),
            endereco=limpar_texto(fake.address()),
        )
        clientes_criados.append(cliente)

        for _ in range(random.randint(1, 2)):
            marca = random.choice(list(MARCAS_MODELOS.keys()))
            moto = Moto.objects.create(
                cliente=cliente,
                marca=marca,
                modelo=random.choice(MARCAS_MODELOS[marca]),
                ano=random.randint(2010, 2025),
                placa=gerar_placa(),
                observacoes=random.choice(OBSERVACOES_MOTO),
            )
            motos_criadas.append(moto)

    # CRIAR PEÇAS
    pecas_criadas = []
    for i in range(TOTAL_PECAS):
        nome_base = random.choice(PECAS_REAIS)
        preco_venda_val = Decimal(random.uniform(25, 1500)).quantize(Decimal("0.01"))
        # Preço de custo é entre 40% a 70% do preço de venda
        preco_custo_val = (preco_venda_val * Decimal(random.uniform(0.4, 0.7))).quantize(Decimal("0.01"))
        
        peca = Peca.objects.create(
            nome=f"{nome_base} {fake.company_suffix()}",
            descricao=f"Peça de alta qualidade tipo {nome_base}, ideal para reposição. Produto com garantia de fábrica e durabilidade estendida.",
            numero_serie=gerar_codigo_peca(),
            preco_custo=preco_custo_val,
            preco_venda=preco_venda_val,
            quantidade_em_estoque=random.randint(1, 200),
            fornecedor=random.choice(fornecedores),
            grupo=random.choice(grupos),
        )
        pecas_criadas.append(peca)

    # CRIAR SERVIÇOS
    for _ in range(TOTAL_SERVICOS):
        moto = random.choice(motos_criadas)
        status_servico = random.choice(STATUS_SERVICO)
        
        # Gerar datas baseadas no status
        data_inicio = timezone.now() - timedelta(days=random.randint(1, 30))
        data_fim = None
        if status_servico in ["CONCLUIDO", "CANCELADO"]:
            data_fim = data_inicio + timedelta(hours=random.randint(1, 48))

        servico = Servico.objects.create(
            cliente=moto.cliente,
            moto=moto,
            descricao=random.choice(DESCRICOES_SERVICOS),
            status=status_servico,
            valor_mao_de_obra=Decimal(random.uniform(80, 1200)).quantize(Decimal("0.01")),
            observacoes=random.choice(OBSERVACOES_SERVICO) if random.random() > 0.3 else "",
            kilometragem=random.randint(1000, 120000),
            responsavel=user,
        )
        
        # Adicionar as datas manualmente (pois auto_now_add substitui na criação)
        servico.data_inicio = data_inicio
        if data_fim:
            servico.data_fim = data_fim
        servico.save()

        # Adicionar peças ao serviço (1 a 4 peças)
        if pecas_criadas:
            num_pecas = random.randint(1, 4)
            pecas_selecionadas = random.sample(pecas_criadas, k=min(num_pecas, len(pecas_criadas)))
            for peca in pecas_selecionadas:
                ItemServicoPeca.objects.create(
                    servico=servico,
                    peca=peca,
                    quantidade_utilizada=random.randint(1, 3),
                    valor_unitario_na_epoca=peca.preco_venda
                )

    print(f"\n🎉 BANCO POPULADO: {TOTAL_CLIENTES} Clientes, {TOTAL_PECAS} Peças, {TOTAL_SERVICOS} Serviços!")

if __name__ == "__main__":
    popular_banco()