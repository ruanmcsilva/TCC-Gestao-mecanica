import urllib.parse

def formatar_zap_link(telefone, mensagem):
    tel_limpo = "".join(filter(str.isdigit, str(telefone)))
    if not tel_limpo.startswith('55'):
        tel_limpo = f"55{tel_limpo}"
    
    msg_encoded = urllib.parse.quote(mensagem)
    return f"https://wa.me/{tel_limpo}?text={msg_encoded}"