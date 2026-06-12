import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { Clock } from 'lucide-react'; 
import Select from 'react-select';

interface MotoData {
  id: number;
  cliente: number;
  marca: string;
  modelo: string;
  ano: number;
  placa: string;
}

interface ClienteData {
  id: number;
  nome: string;
  telefone: string;
  email: string;
}

const MotoPage: React.FC = () => {
  const [motos, setMotos] = useState<MotoData[]>([]);
  const [clientes, setClientes] = useState<ClienteData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newMoto, setNewMoto] = useState<Omit<MotoData, 'id'>>({
    cliente: 0, marca: '', modelo: '', ano: new Date().getFullYear(), placa: '',
  });
  const [editingMoto, setEditingMoto] = useState<MotoData | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
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
      
      const fetchAllClientes = async () => {
        let allClientes: ClienteData[] = [];
        let url: string | null = '/clientes/?page_size=100';
        while (url) {
          const res: any = await api.get(url);
          allClientes = [...allClientes, ...res.data.results];
          url = res.data.next;
        }
        return allClientes;
      };

      const [motosRes, allClientes] = await Promise.all([
        api.get(`/motos/`, { params }),
        fetchAllClientes(), 
      ]);
      
      setMotos(motosRes.data.results);
      setClientes(allClientes);
      setNextPageUrl(motosRes.data.next);
      setPreviousPageUrl(motosRes.data.previous);

      const total = Math.ceil(motosRes.data.count / 10);
      setTotalPages(total || 1);
      setInputPage(page.toString());
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const handler = setTimeout(() => fetchData(currentPage, searchTerm), 200);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const parsedValue = name === 'cliente' || name === 'ano' ? Number(value) : value;
    if (editingMoto) setEditingMoto({ ...editingMoto, [name]: parsedValue });
    else setNewMoto({ ...newMoto, [name]: parsedValue });
  };

  const handleAddMoto = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/motos/', newMoto);
      setNewMoto({ cliente: 0, marca: '', modelo: '', ano: new Date().getFullYear(), placa: '' });
      setIsFormVisible(false);
      setCurrentPage(1);
      showNotification('Moto adicionada!', 'success');
    } catch (err) { showNotification('Erro ao adicionar.', 'error'); }
  };

  const handleUpdateMoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMoto) return;
    try {
      await api.put(`/motos/${editingMoto.id}/`, editingMoto);
      setEditingMoto(null);
      setIsFormVisible(false);
      fetchData(currentPage, searchTerm);
      showNotification('Moto atualizada!', 'success');
    } catch (err) { showNotification('Erro ao atualizar.', 'error'); }
  };

  const handleDeleteMoto = async (id: number) => {
    if (window.confirm('Excluir esta moto?')) {
      try {
        await api.delete(`/motos/${id}/`);
        fetchData(currentPage, searchTerm);
        showNotification('Moto excluída.', 'success');
      } catch (err) { showNotification('Erro ao excluir.', 'error'); }
    }
  };

  const getClientData = (clientId: number) => clientes.find(c => c.id === clientId);

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
            placeholder="Pesquisar por modelo, placa ou nome do dono..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none shadow-sm font-medium"
          />
        </div>

        <button
          onClick={() => { setIsFormVisible(!isFormVisible); setEditingMoto(null); }}
          className="bg-orange-500 rounded-full p-2.5 hover:bg-orange-600 shadow-md transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormVisible ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border-t-4 border-orange-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{editingMoto ? 'Editar Moto' : 'Nova Moto'}</h2>
          <form onSubmit={editingMoto ? handleUpdateMoto : handleAddMoto} className="grid grid-cols-2 gap-4">
            <Select
              name="cliente"
              options={clientes.map(c => ({ value: c.id, label: c.nome }))}
              value={
                editingMoto && editingMoto.cliente
                  ? { value: editingMoto.cliente, label: clientes.find(c => c.id === editingMoto.cliente)?.nome }
                  : newMoto.cliente
                  ? { value: newMoto.cliente, label: clientes.find(c => c.id === newMoto.cliente)?.nome }
                  : null
              }
              onChange={(selectedOption) => {
                const value = selectedOption ? selectedOption.value : 0;
                if (editingMoto) {
                  setEditingMoto({ ...editingMoto, cliente: value });
                } else {
                  setNewMoto({ ...newMoto, cliente: value });
                }
              }}
              placeholder="Selecione um cliente"
              className="font-bold text-sm"
              isClearable
            />
            <input type="text" name="marca" placeholder="Marca (Ex: Honda)" value={(editingMoto ? editingMoto.marca : newMoto.marca) || ''} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <input type="text" name="modelo" placeholder="Modelo (Ex: CB 500)" value={(editingMoto ? editingMoto.modelo : newMoto.modelo) || ''} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <input type="number" name="ano" placeholder="Ano" value={(editingMoto ? editingMoto.ano : newMoto.ano) || ''} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <input type="text" name="placa" placeholder="Placa" value={(editingMoto ? editingMoto.placa : newMoto.placa) || ''} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 bg-gray-400 text-white rounded font-bold uppercase text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold uppercase text-xs cursor-pointer">{editingMoto ? 'Atualizar Dados' : 'Salvar Moto'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 flex-grow flex flex-col min-h-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Lista de Motos</h2>
          {searchTerm && <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase">{motos.length} Encontrada(s)</span>}
        </div>

        <div className="grid grid-cols-5 gap-4 pb-3 px-2 text-gray-700 font-bold text-sm text-center">
          <div className="text-left">Dono (Cliente)</div>
          <div>Moto / Modelo</div>
          <div>Placa</div>
          <div>Contato</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="h-[1px] bg-black w-full mb-2"></div>

        {loading ? <p className="text-center py-10 text-gray-500 font-bold uppercase text-xs">Carregando...</p> : (
          <div className="divide-y divide-gray-50 flex-grow overflow-y-auto pr-2">
            {motos.map(moto => {
              const clienteInfo = getClientData(moto.cliente);
              return (
                <div key={moto.id} className="grid grid-cols-5 gap-4 items-center px-2 py-4 hover:bg-blue-50 transition-colors text-center">
                  <div className="text-gray-900 font-bold text-left uppercase text-[11px]">{clienteInfo?.nome || '---'}</div>
                  <div className="text-sm text-gray-600 font-medium">{moto.marca} {moto.modelo} ({moto.ano})</div>
                  <div className="text-sm text-gray-600 font-mono font-bold tracking-tighter">{moto.placa}</div>
                  <div className="text-sm text-gray-500 font-bold">{clienteInfo?.telefone || '---'}</div>
                  <div className="flex justify-end gap-6 font-black text-[10px] uppercase">
                    <button onClick={() => { setEditingMoto(moto); setIsFormVisible(true); }} className="text-yellow-600 hover:text-yellow-700 cursor-pointer">Editar</button>
                    <button onClick={() => handleDeleteMoto(moto.id)} className="text-red-300 hover:text-red-600 cursor-pointer">Excluir</button>
                  </div>
                </div>
              );
            })}
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

export default MotoPage;