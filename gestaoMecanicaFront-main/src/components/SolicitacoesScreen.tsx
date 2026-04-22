import React, { useEffect, useState } from 'react';
import api from '../api/api';
import { Check, Mail, Clock, UserCheck } from 'lucide-react';

interface Convite {
  id: number;
  email: string;
  autorizado: boolean;
  criado_em: string;
}

export default function SolicitacoesScreen() {
  const [convites, setConvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarConvites = async () => {
    try {
      const response = await api.get('convites/lista/');
      setConvites(response.data);
    } catch (error) {
      console.error("Erro ao carregar convites");
    } finally {
      setLoading(false);
    }
  };

  const autorizar = async (id: number) => {
    try {
      await api.post(`autorizar-acesso/${id}/`);
      alert("Acesso autorizado! O link de cadastro foi enviado por e-mail.");
      carregarConvites(); // Atualiza a lista
    } catch (error) {
      alert("Erro ao autorizar usuário.");
    }
  };

  useEffect(() => { carregarConvites(); }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <UserCheck className="text-amber-500" size={32} />
        <h1 className="text-2xl font-bold text-gray-800">Solicitações de Acesso</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="p-4 font-semibold text-gray-600">E-mail do Interessado</th>
              <th className="p-4 font-semibold text-gray-600">Data do Pedido</th>
              <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
              <th className="p-4 font-semibold text-gray-600 text-right">Ação</th>
            </tr>
          </thead>
          <tbody>
            {convites.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4 flex items-center gap-2">
                  <Mail size={16} className="text-gray-400" />
                  <span className="text-gray-700 font-medium">{c.email}</span>
                </td>
                <td className="p-4 text-gray-500 text-sm">
                  {new Date(c.criado_em).toLocaleDateString('pt-BR')}
                </td>
                <td className="p-4 text-center">
                  {c.autorizado ? (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">Autorizado</span>
                  ) : (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold">Pendente</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  {!c.autorizado && (
                    <button
                      onClick={() => autorizar(c.id)}
                      className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all"
                    >
                      <Check size={16} /> Autorizar
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {convites.length === 0 && !loading && (
          <div className="p-10 text-center text-gray-500">Nenhuma solicitação encontrada.</div>
        )}
      </div>
    </div>
  );
}