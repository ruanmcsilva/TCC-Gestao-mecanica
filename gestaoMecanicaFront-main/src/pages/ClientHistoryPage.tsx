// src/pages/ClientHistoryPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useNotification } from '../contexts/NotificationContext';

const ClientHistoryPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  
  // 1. Iniciamos como array vazio [] para evitar o erro de 'undefined'
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/clientes/${id}/historico/`);
        // 2. Garantimos que se a API não trouxer resultados, salvaremos um array vazio
        setHistory(response.data || []);
      } catch (err) {
        showNotification('Erro ao carregar histórico.', 'error');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchHistory();
  }, [id, showNotification]);

  if (loading) return <div className="p-8 text-center text-gray-600">Carregando histórico...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Histórico do Cliente</h1>
        <button 
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
        >
          Voltar
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* 3. PROTEÇÃO: Verificamos se history existe e se tem tamanho */}
        {!history || history.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum serviço encontrado para este cliente.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 border-b font-bold">Data</th>
                <th className="p-4 border-b font-bold">Serviço</th>
                <th className="p-4 border-b font-bold">Status</th>
                <th className="p-4 border-b font-bold text-right">Valor</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 border-b">
                  <td className="p-4 text-sm">
                    {new Date(item.data_inicio).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="p-4">
                    <div className="font-medium">{item.descricao}</div>
                    <div className="text-xs text-gray-400">{item.moto_detalhes?.modelo || 'Moto não identificada'}</div>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      item.status === 'CONCLUIDO' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-4 text-right font-semibold">
                    R$ {parseFloat(item.valor_total).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ClientHistoryPage;