from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Servico

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def marcar_pago_maquininha(request, pk):
    servico = get_object_or_404(Servico, pk=pk)
    
    if servico.status_pagamento == 'PAGO':
        return Response({'message': 'Serviço já consta como pago.'}, status=400)
        
    metodo = request.data.get('metodo', 'MAQUININHA/PIX')

    servico.status_pagamento = 'PAGO'
    servico.status = 'CONCLUIDO'
    servico.descricao = f"{servico.descricao} | PAGO: {metodo}"
    servico.save()
    
    return Response({
        'message': f'Pagamento via {metodo} registrado com sucesso!',
        'status_pagamento': servico.status_pagamento
    })
