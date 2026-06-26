def gerar_payload_pix(chave_pix, nome_recebedor, cidade_recebedor, valor, txid="***"):
    nome_recebedor = nome_recebedor[:25].upper()
    cidade_recebedor = cidade_recebedor[:15].upper()
    
    payload_format = "000201"
    
    merchant_account_info = f"0014br.gov.bcb.pix01{len(chave_pix):02}{chave_pix}"
    merchant_account_info = f"26{len(merchant_account_info):02}{merchant_account_info}"
    
    merchant_category_code = "52040000"
    transaction_currency = "5303986"
    
    transaction_amount = ""
    if valor:
        valor_str = f"{float(valor):.2f}"
        transaction_amount = f"54{len(valor_str):02}{valor_str}"
        
    country_code = "5802BR"
    
    merchant_name = f"59{len(nome_recebedor):02}{nome_recebedor}"
    merchant_city = f"60{len(cidade_recebedor):02}{cidade_recebedor}"
    
    additional_data = f"05{len(txid):02}{txid}"
    additional_data = f"62{len(additional_data):02}{additional_data}"
    
    payload = payload_format + merchant_account_info + merchant_category_code + transaction_currency + transaction_amount + country_code + merchant_name + merchant_city + additional_data + "6304"
    
    poly = 0x1021
    crc = 0xFFFF
    for byte in payload.encode('utf-8'):
        crc ^= (byte << 8)
        for _ in range(8):
            if crc & 0x8000:
                crc = (crc << 1) ^ poly
            else:
                crc <<= 1
            crc &= 0xFFFF
            
    return payload + f"{crc:04X}"

print(gerar_payload_pix('82987599481', 'YURI MARCOS DA SILVA', 'SAO PAULO', 150.00, 'OS123'))
