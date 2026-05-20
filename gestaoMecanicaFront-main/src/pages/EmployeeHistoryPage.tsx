import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { useNotification } from '../contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { Hash, Calendar, User, ArrowRight } from 'lucide-react';

const EmployeeHistoryPage: React.FC = () => {
  const { showNotification } = useNotification();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get('/servicos/', { params: { page_size: 50 } });
        // O endpoint pode ser paginado, retornando um objeto com 'results'
        const dataArray = response.data.results || response.data || [];
        // Ordenar por data mais recente e pegar os 50 últimos para o histórico simples
        const sortedData = dataArray.sort((a: any, b: any) => {
          const dateA = a.data_fim || a.data_inicio;
          const dateB = b.data_fim || b.data_inicio;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        }).slice(0, 50);
        setHistory(sortedData);
      } catch (err) {
        showNotification('Erro ao carregar histórico.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [showNotification]);

  if (loading) return <div className="p-8 text-center text-gray-600 font-bold h-screen flex items-center justify-center">Carregando histórico...</div>;

  return (
    <div className="h-full flex flex-col font-sans overflow-hidden">
      <div className="flex justify-between items-center mb-8 px-6 pt-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Histórico de Atividades</h1>
          <p className="text-sm text-gray-500 font-medium">Últimos serviços e vendas registrados no sistema</p>
        </div>
      </div>

      <div className="px-6 flex-grow pb-6 overflow-hidden flex flex-col">
        {!history || history.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center text-gray-500 font-medium flex-grow flex items-center justify-center">
            Nenhum serviço recente encontrado.
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-[100%] mx-auto flex-grow flex flex-col">
            <div className="overflow-y-auto flex-grow custom-scrollbar">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                  <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-5 bg-gray-50"><Hash size={14} className="inline mr-1" /> ID</th>
                    <th className="px-6 py-5 bg-gray-50"><Calendar size={14} className="inline mr-1" /> Data e Hora</th>
                    <th className="px-6 py-5 bg-gray-50"><User size={14} className="inline mr-1" /> Mecânico Responsável</th>
                    <th className="px-6 py-5 text-right bg-gray-50">Ver Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {history.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <span className="font-black text-gray-900 italic">#{item.id}</span>
                          <span className="text-gray-300">|</span>
                          {item.cliente_nome === "CONSUMIDOR PADRAO" || item.descricao?.includes("BALCÃO") ? (
                            <span className="text-[10px] font-black text-blue-600 uppercase">Venda Balcão</span>
                          ) : (
                            <span className="text-[11px] font-black text-orange-600 uppercase">{item.cliente_nome || '---'}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-sm font-bold text-gray-700">
                          {(item.data_fim || item.data_inicio) ? new Date(item.data_fim || item.data_inicio).toLocaleDateString('pt-BR') : '---'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-black text-gray-600 uppercase">
                        {item.responsavel_nome || 'Admin'}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={() => navigate(`/servicos/${item.id}`)} 
                          className="p-3 bg-gray-100 text-gray-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all cursor-pointer"
                        >
                          <ArrowRight size={20} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeHistoryPage;
