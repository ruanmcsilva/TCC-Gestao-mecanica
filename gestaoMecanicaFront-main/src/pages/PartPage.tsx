import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

interface PartData {
  id: number;
  nome: string;
  descricao?: string;
  numero_serie?: string;
  preco_custo: number;
  preco_venda: number;
  quantidade_em_estoque: number;
}

const PartPage: React.FC = () => {
  const LOW_STOCK_LIMIT = 5;
  const [parts, setParts] = useState<PartData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [editingPart, setEditingPart] = useState<PartData | null>(null);
  
  const [newPart, setNewPart] = useState({
    nome: '',
    descricao: '',
    numero_serie: '',
    preco_custo: '',
    preco_venda: '',
    quantidade_em_estoque: '',
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>('1');
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchData = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      const response = await api.get(`/pecas/`, { params });
      setParts(response.data.results);
      setNextPageUrl(response.data.next);
      setPreviousPageUrl(response.data.previous);
      
      const total = Math.ceil(response.data.count / 10);
      setTotalPages(total || 1);
      setInputPage(page.toString());
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData(currentPage, searchTerm);
    }, 200);
    return () => clearTimeout(handler);
  }, [currentPage, searchTerm, fetchData]);

  const handleJumpPage = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setInputPage(currentPage.toString());
      showNotification(`Página inválida. Total: ${totalPages}`, 'info');
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleEditClick = (part: PartData) => {
    setEditingPart(part);
    setIsFormVisible(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingPart) {
      setEditingPart({ ...editingPart, [name]: value });
    } else {
      setNewPart({ ...newPart, [name]: value });
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dataToSend = {
        ...newPart,
        preco_custo: Number(newPart.preco_custo),
        preco_venda: Number(newPart.preco_venda),
        quantidade_em_estoque: Number(newPart.quantidade_em_estoque),
      };

      await api.post('/pecas/', dataToSend);
      setNewPart({ nome: '', descricao: '', numero_serie: '', preco_custo: '', preco_venda: '', quantidade_em_estoque: '' });
      setIsFormVisible(false);
      fetchData(1, searchTerm);
      showNotification('Peça cadastrada!', 'success');
    } catch (err) { showNotification('Erro ao adicionar.', 'error'); }
  };

  const handleUpdatePart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPart) return;
    try {
      const dataToUpdate = {
        ...editingPart,
        preco_custo: Number(editingPart.preco_custo),
        preco_venda: Number(editingPart.preco_venda),
        quantidade_em_estoque: Number(editingPart.quantidade_em_estoque),
      };

      await api.put(`/pecas/${editingPart.id}/`, dataToUpdate);
      setEditingPart(null);
      setIsFormVisible(false);
      fetchData(currentPage, searchTerm);
      showNotification('Peça atualizada!', 'success');
    } catch (err) { showNotification('Erro ao atualizar.', 'error'); }
  };

  const handleDeletePart = async (id: number) => {
    if (window.confirm('Excluir esta peça?')) {
      try {
        await api.delete(`/pecas/${id}/`);
        fetchData(currentPage, searchTerm);
        showNotification('Peça removida.', 'success');
      } catch (err) { showNotification('Erro ao excluir.', 'error'); }
    }
  };

  return (
    <div className={`h-full flex flex-col font-sans ${isFormVisible ? 'overflow-y-auto' : 'overflow-hidden'}`}>
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-2/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Buscar peças por nome ou N° de série..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none shadow-sm font-medium"
          />
        </div>

        <button
          onClick={() => { 
            setIsFormVisible(!isFormVisible); 
            setEditingPart(null);
            setNewPart({ nome: '', descricao: '', numero_serie: '', preco_custo: '', preco_venda: '', quantidade_em_estoque: '' });
          }}
          className="bg-orange-500 rounded-full p-2.5 hover:bg-orange-600 shadow-md transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormVisible ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border-t-4 border-orange-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{editingPart ? 'Editar Peça' : 'Nova Peça'}</h2>
          <form onSubmit={editingPart ? handleUpdatePart : handleAddPart} className="grid grid-cols-2 gap-4">
            <input type="text" name="nome" placeholder="Nome da Peça" value={(editingPart ? editingPart.nome : newPart.nome) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500 font-bold" required />
            <input type="text" name="numero_serie" placeholder="N° de Série (Opcional)" value={(editingPart ? editingPart.numero_serie : newPart.numero_serie) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500" />
            <input type="number" name="quantidade_em_estoque" placeholder="Qtd em Estoque" value={(editingPart ? editingPart.quantidade_em_estoque : newPart.quantidade_em_estoque) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500 font-bold" required />
            <input type="number" step="any" name="preco_custo" placeholder="Preço de Custo (Ex: 30)" value={(editingPart ? editingPart.preco_custo : newPart.preco_custo) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500 text-red-600 font-bold" />
            <input type="number" step="any" name="preco_venda" placeholder="Preço de Venda (Ex: 50)" value={(editingPart ? editingPart.preco_venda : newPart.preco_venda) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500 text-green-600 font-bold" required />
            <div className="col-span-2">
              <textarea name="descricao" placeholder="Descrição/Observações" value={(editingPart ? editingPart.descricao : newPart.descricao) || ''} onChange={handleInputChange} className="w-full p-2 border rounded h-20 outline-none focus:ring-1 focus:ring-orange-500 font-medium" />
            </div>
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => {setIsFormVisible(false); setEditingPart(null);}} className="px-4 py-2 bg-gray-400 text-white rounded font-bold uppercase text-xs cursor-pointer hover:bg-gray-500 transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold uppercase text-xs cursor-pointer hover:bg-green-700 transition-colors">{editingPart ? 'Atualizar Dados' : 'Salvar Peça'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 flex-grow flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Lista de Peças</h2>
        </div>

        <div className="grid grid-cols-6 gap-4 pb-3 px-2 text-gray-700 font-bold text-sm text-center">
          <div className="text-left">Nome</div>
          <div>N° de Série</div>
          <div>Estoque</div>
          <div>Custo</div>
          <div>Venda</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="h-[1px] bg-black w-full mb-2"></div>

        {loading ? <p className="text-center py-10 text-gray-500 font-bold uppercase text-xs">Carregando estoque...</p> : (
          <div className="divide-y divide-gray-50 flex-grow pr-2">
            {parts.length > 0 ? parts.map(part => {
              const isLowStock = part.quantidade_em_estoque <= LOW_STOCK_LIMIT;
              return (
              <div 
                key={part.id} 
                className={`grid grid-cols-6 gap-4 items-center px-2 py-4 transition-colors text-center ${isLowStock ? 'bg-red-50 hover:bg-red-100 border-l-4 border-red-500' : 'hover:bg-blue-50'}`}
              >
                <div className="text-gray-900 font-bold text-left uppercase text-[11px] flex flex-col items-start gap-1">
                  {part.nome}
                  {isLowStock && (
                    <span className="w-fit bg-red-100 text-red-600 text-[9px] px-1.5 py-0.5 rounded font-black border border-red-200 flex items-center gap-1 shadow-sm">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      ESTOQUE BAIXO
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-500 font-medium">{part.numero_serie || '---'}</div>
                <div className={`text-sm font-black ${isLowStock ? 'text-red-600' : 'text-gray-700'}`}>{part.quantidade_em_estoque}</div>
                <div className="text-sm text-red-500 font-bold">R$ {Number(part.preco_custo).toFixed(2)}</div>
                <div className="text-sm text-green-600 font-black">R$ {Number(part.preco_venda).toFixed(2)}</div>
                <div className="flex justify-end gap-4 font-black text-[10px] uppercase">
                  <button onClick={() => handleEditClick(part)} className="text-yellow-600 hover:text-yellow-700 cursor-pointer">Editar</button>
                  <button onClick={() => handleDeletePart(part.id)} className="text-red-300 hover:text-red-600 cursor-pointer">Excluir</button>
                </div>
              </div>
            )}) : <p className="text-center py-4 text-gray-400">Nenhuma peça encontrada.</p>}
          </div>
        )}

        <div className="flex justify-between items-center mt-10 pt-4 border-t border-gray-100 font-black uppercase text-xs">
          <button 
            onClick={() => setCurrentPage(p => p - 1)} 
            disabled={!previousPageUrl || loading} 
            className={`text-blue-600 transition-all ${!previousPageUrl || loading ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:px-2'}`}
          >
            {"<"} Voltar
          </button>
          
          <div className="flex items-center gap-2">
            <span className="text-gray-400">Pág.</span>
            <input 
              type="text" 
              value={inputPage}
              onChange={(e) => setInputPage(e.target.value)}
              onBlur={handleJumpPage}
              onKeyDown={(e) => e.key === 'Enter' && handleJumpPage()}
              className="w-10 h-7 text-center border-2 border-orange-100 rounded-lg text-gray-800 outline-none focus:border-orange-500 transition-all font-bold"
            />
            <span className="text-gray-400">de {totalPages}</span>
          </div>

          <button 
            onClick={() => setCurrentPage(p => p + 1)} 
            disabled={!nextPageUrl || loading} 
            className={`text-blue-600 transition-all ${!nextPageUrl || loading ? 'text-gray-300 cursor-default' : 'cursor-pointer hover:px-2'}`}
          >
            Próximo {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartPage;