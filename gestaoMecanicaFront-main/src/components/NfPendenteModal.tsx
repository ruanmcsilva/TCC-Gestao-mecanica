import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNotification } from '../contexts/NotificationContext';

export const NfPendenteModal: React.FC = () => {
  const { showNotification } = useNotification();
  const [pendente, setPendente] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkPendentes = async () => {
      // Se já tem um modal aberto, não precisa ficar chamando
      if (pendente) return;
      
      try {
        const response = await api.get('/pecas/nf-pendentes/');
        if (response.data && response.data.has_pendente) {
          setPendente(response.data);
          const rawItens = response.data.itens || [];
          const formatItens = rawItens.map((it: any) => ({
            ...it,
            preco_venda: it.preco_venda || ''
          }));
          setItens(formatItens);
        }
      } catch (err: any) {
        console.log("Aguardando nota fiscal...");
      }
    };

    const interval = setInterval(checkPendentes, 30000);
    return () => clearInterval(interval);
  }, [pendente]);

  const handlePrecoChange = (index: number, value: string) => {
    const newItens = [...itens];
    newItens[index].preco_venda = value;
    setItens(newItens);
  };

  const handleDiscard = async () => {
    try {
      await api.delete(`/pecas/nf-pendentes/${pendente.id}/`);
      setPendente(null);
      setItens([]);
    } catch (err) {
      showNotification('Erro ao descartar nota.', 'error');
    }
  };

  const handleConfirm = async () => {
    // Validar se todos têm preco_venda
    const hasEmpty = itens.some(it => !it.preco_venda || isNaN(parseFloat(it.preco_venda.toString().replace(',', '.'))));
    if (hasEmpty) {
      showNotification('Preencha um valor de venda válido para todas as peças.', 'warning');
      return;
    }

    setIsSubmitting(true);
    try {
      const formattedItens = itens.map(it => ({
        ...it,
        preco_venda: parseFloat(it.preco_venda.toString().replace(',', '.'))
      }));

      const match = window.location.pathname.match(/\/servicos\/(\d+)/);
      const urlServicoId = match ? match[1] : null;
      const finalServicoId = pendente?.servico_id || urlServicoId;

      await api.post('/pecas/confirmar-nf/', {
        pendente_id: pendente.id,
        itens: formattedItens,
        servico_id: finalServicoId
      });
      
      showNotification('Peças cadastradas com sucesso!', 'success');
      setPendente(null);
      setItens([]);
      if (finalServicoId) {
        window.location.reload();
      }
    } catch (err) {
      showNotification('Erro ao confirmar peças.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!pendente) return null;

  const match = window.location.pathname.match(/\/servicos\/(\d+)/);
  const urlServicoId = match ? match[1] : null;
  const displayServicoId = pendente?.servico_id || urlServicoId;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-6 border-b border-gray-200 bg-orange-50 relative">
          <h2 className="text-xl font-bold text-gray-800">Nota Fiscal Digitalizada Recebida!</h2>
          <p className="text-sm text-gray-600 mt-1">A IA extraiu as peças abaixo da sua foto. Preencha o preço de venda para concluir.</p>
          
          {displayServicoId && (
            <div className="absolute top-6 right-6 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-bold border border-green-200 flex items-center gap-1 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              VINCULANDO À OS #{displayServicoId}
              {pendente?.cliente_nome && <span className="ml-2 border-l border-green-300 pl-2 font-normal truncate max-w-[200px]">{pendente.cliente_nome}</span>}
              {pendente?.moto_modelo && <span className="ml-2 text-[10px] bg-green-200 px-2 py-0.5 rounded-full text-green-800">{pendente.moto_modelo}</span>}
            </div>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto flex-grow">
          {itens.length === 0 ? (
            <div className="text-center p-4 text-gray-500">Nenhum item foi encontrado pela IA na imagem.</div>
          ) : (
            <div className="space-y-4">
              {itens.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100 items-end">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Nome Extraído da Nota</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded bg-white text-gray-800 font-medium" 
                      value={item.nome_peca || ''} 
                      onChange={(e) => {
                        const newItens = [...itens];
                        newItens[index].nome_peca = e.target.value;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Preço de Custo (R$)</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border border-gray-300 rounded bg-gray-200 text-gray-600 cursor-not-allowed" 
                      value={Number(item.valor_unitario).toFixed(2)} 
                      readOnly 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-orange-600 mb-1">Preço de Venda (R$)*</label>
                    <input 
                      type="number" 
                      step="0.01"
                      className="w-full p-2 border-2 border-orange-300 rounded bg-white focus:outline-none focus:border-orange-500 font-bold" 
                      placeholder="0.00"
                      value={item.preco_venda} 
                      onChange={(e) => handlePrecoChange(index, e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between items-center bg-gray-50">
          <button 
            onClick={handleDiscard}
            className="px-4 py-2.5 rounded-lg font-semibold text-red-600 hover:bg-red-50 transition-colors"
          >
            Excluir (Descartar)
          </button>
          <div className="flex gap-3">
            <button 
              onClick={() => setPendente(null)}
              className="px-6 py-2.5 rounded-lg font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Minimizar
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting || itens.length === 0}
              className={`px-6 py-2.5 rounded-lg font-bold text-white transition-colors ${
                isSubmitting || itens.length === 0 ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Peças no Sistema'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
