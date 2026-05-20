from django.conf import settings

try:
    from focusnfe import FocusNFe
except ImportError:
    FocusNFe = None

class FiscalService:
    def __init__(self):
        self.client = None
        if FocusNFe is not None:
            self.client = FocusNFe(
                token=settings.FOCUSNFE_TOKEN,
                ambiente=settings.FOCUSNFE_AMBIENTE
            )

    def emitir_nfc_e(self, venda):
        """
        venda: Instância do modelo Servico (seu projeto de TCC)
        """
        # 1. Preparamos os itens da venda (Peças)
        items = []
        # Buscamos os itens vinculados a esse serviço/venda
        itens_servico = venda.itens_servico_peca.all()

        for i, item in enumerate(itens_servico, start=1):
            items.append({
                "numero_item": str(i),
                "codigo_produto": str(item.peca.id),
                "descricao": item.peca.nome,
                "cfop": "5102",  # Venda de mercadoria adquirida de terceiros
                "unidade_comercial": "UN",
                "quantidade_comercial": float(item.quantidade_utilizada),
                "valor_unitario_comercial": float(item.valor_unitario_na_epoca),
                "ncm": "8708.99.90",  # NCM genérico para partes de veículos
                "valor_total_bruto": float(item.quantidade_utilizada * item.valor_unitario_na_epoca),
                "icms_situacao_tributaria": "102",  # Simples Nacional - Sem permissão de crédito
                "icms_origem": "0",  # Nacional
            })

        # 2. Montamos o corpo da Nota (NFC-e - Nota de Balcão)
        payload = {
            "data_emissao": venda.data_inicio.strftime("%Y-%m-%dT%H:%M:%S"),
            "local_destino": "1", # Operação Interna
            "presenca_comprador": "1", # Operação presencial
            "consumidor_final": "1", # Sim
            "finalidade_emissao": "1", # Normal
            "valor_total_bruto": float(venda.valor_total_pecas), # Certifique-se de ter esse property ou campo
            "items": items,
            "formas_pagamento": [
                {
                    "forma_pagamento": "01" if "DINHEIRO" in venda.descricao else "03" if "CARTÃO" in venda.descricao else "04", # Mapeia forma
                    "valor_pagamento": float(venda.valor_total_pecas)
                }
            ]
        }

        # 3. Enviar para a FocusNF-e
        # r = self.client.nfce.autorizar(venda.id, payload)
        
        # Como estamos no TCC, vamos simular o retorno de sucesso se a API não estiver ativa
        return {
            "status": "sucesso",
            "url_danfe": f"https://homologacao.focusnfe.com.br/danfe/nfc-e/{venda.id}",
            "xml": "xml_da_nota_aqui"
        }
