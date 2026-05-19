import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

// Interfaces mantidas...
interface ServiceData {
  id: number;
  cliente: number;
  moto: number;
  data_servico: string;
  observacoes?: string;
  kilometragem: number;
  descricao: string;
  status: string;
}
interface ClienteData { id: number; nome: string; }
interface MotoData { id: number; placa: string; modelo: string; }

const ServicePage: React.FC = () => {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [clients, setClients] = useState<ClienteData[]>([]);
  const [motos, setMotos] = useState<MotoData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [newService, setNewService] = useState<Omit<ServiceData, 'id'>>({
    cliente: 0, moto: 0, data_servico: '', observacoes: '', kilometragem: 0, descricao: '', status: 'PENDENTE'
  });

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');

  // NOVOS ESTADOS PARA PAGINAÇÃO
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>('1');

  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        search: searchTerm || undefined,
        status: selectedStatusFilter || undefined,
        exclude_balcao: 'true'
      };

      const [resServ, resCli, resMoto] = await Promise.all([
        api.get('/servicos/', { params }),
        api.get('/clientes/', { params: { page_size: 1000 } }),
        api.get('/motos/', { params: { page_size: 1000 } }),
      ]);

      setServices(resServ.data.results);
      setClients(resCli.data.results);
      setMotos(resMoto.data.results);
      setNextPageUrl(resServ.data.next);
      setPreviousPageUrl(resServ.data.previous);

      // Cálculo do total de páginas
      const total = Math.ceil(resServ.data.count / 10);
      setTotalPages(total || 1);
      setInputPage(currentPage.toString());

    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedStatusFilter, navigate]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 200);
    return () => clearTimeout(handler);
  }, [fetchData]);

  // Função para pular direto para uma página
  const handleJumpPage = () => {
    const pageNum = parseInt(inputPage);
    if (!isNaN(pageNum) && pageNum >= 1 && pageNum <= totalPages) {
      setCurrentPage(pageNum);
    } else {
      setInputPage(currentPage.toString());
      showNotification(`Página inválida. Total disponível: ${totalPages}`, 'info');
    }
  };

  const handleStatusFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStatusFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const finalValue = (name === 'kilometragem' || name === 'cliente' || name === 'moto') ? Number(value) : value;
    setNewService({ ...newService, [name]: finalValue });
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/servicos/', newService);
      setNewService({ cliente: 0, moto: 0, data_servico: '', observacoes: '', kilometragem: 0, descricao: '', status: 'PENDENTE' });
      setIsFormVisible(false);
      setCurrentPage(1);
      showNotification('Serviço aberto!', 'success');
    } catch (err) { showNotification('Erro ao abrir serviço.', 'error'); }
  };

  const handleDeleteService = async (id: number) => {
    if (window.confirm('Excluir este serviço?')) {
      try {
        await api.delete(`/servicos/${id}/`);
        fetchData();
        showNotification('Excluído!', 'success');
      } catch (err) { showNotification('Erro ao excluir.', 'error'); }
    }
  };

  const getClientName = (id: number) => clients.find(c => c.id === id)?.nome || '---';
  const getMotoInfo = (id: number) => {
    const m = motos.find(mo => mo.id === id);
    return m ? { modelo: m.modelo, placa: m.placa } : { modelo: '---', placa: '---' };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8 gap-4">
        <div className="relative w-2/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Pesquisar por placa, cliente, modelo ou descrição..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none shadow-sm font-medium"
          />
        </div>

        <button
          onClick={() => setIsFormVisible(!isFormVisible)}
          className="bg-orange-500 rounded-full p-2.5 hover:bg-orange-600 shadow-md transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormVisible ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border-t-4 border-orange-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800 uppercase">Abrir Nova Ordem</h2>
          <form onSubmit={handleAddService} className="grid grid-cols-2 gap-4">
            <select name="cliente" value={newService.cliente} onChange={handleInputChange} className="p-2 border rounded outline-none font-bold cursor-pointer" required>
              <option value="0">Selecione o Cliente</option>
              {clients.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
            </select>
            <select name="moto" value={newService.moto} onChange={handleInputChange} className="p-2 border rounded outline-none font-bold cursor-pointer" required>
              <option value="0">Selecione a Moto</option>
              {motos.map(m => <option key={m.id} value={m.id}>{m.placa} - {m.modelo}</option>)}
            </select>
            <input type="date" name="data_servico" value={newService.data_servico} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <input type="number" name="kilometragem" placeholder="KM Atual" value={newService.kilometragem} onChange={handleInputChange} className="p-2 border rounded font-bold" required />
            <div className="col-span-2">
              <textarea name="descricao" placeholder="Descrição detalhada do serviço..." value={newService.descricao} onChange={handleInputChange} className="w-full p-2 border rounded h-24 font-medium outline-none focus:ring-1 focus:ring-orange-500" required />
            </div>
            <div className="col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 bg-gray-400 text-white rounded font-black uppercase text-xs cursor-pointer">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-black uppercase text-xs cursor-pointer">Abrir Serviço</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Fila de Serviços</h2>

          <div className="flex items-center gap-2">
            {searchTerm && <span className="text-[10px] font-black bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase mr-4">{services.length} Encontrado(s)</span>}
            <span className="text-gray-500 text-[10px] font-black uppercase">Filtrar Status:</span>
            <select
              value={selectedStatusFilter}
              onChange={handleStatusFilterChange}
              className="text-black text-[10px] font-bold border-2 border-gray-100 rounded-lg px-2 py-1 outline-none cursor-pointer hover:border-orange-500 transition-colors uppercase"
            >
              <option value="">Todos</option>
              <option value="PENDENTE">Pendente</option>
              <option value="EM_ANDAMENTO">Andamento</option>
              <option value="CONCLUIDO">Concluído</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 pb-3 px-2 text-gray-700 font-bold text-sm text-center">
          <div className="text-left">Dono / Cliente</div>
          <div>Moto</div>
          <div>Placa</div>
          <div>Status</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="h-[1px] bg-black w-full mb-2"></div>

        {loading ? <p className="text-center py-10 text-gray-500 font-bold uppercase text-[10px]">Buscando na oficina...</p> : (
          <div className="divide-y divide-gray-50">
            {services.map(service => {
              const motoInfo = getMotoInfo(service.moto);
              return (
                <div key={service.id} className="grid grid-cols-5 gap-4 items-center px-2 py-4 hover:bg-blue-50 transition-all cursor-default text-center">
                  <div className="text-gray-900 font-bold text-left uppercase text-[11px]">{getClientName(service.cliente)}</div>
                  <div className="text-sm text-gray-600 font-medium">{motoInfo.modelo}</div>
                  <div className="text-sm text-gray-600 font-mono font-bold tracking-tighter">{motoInfo.placa}</div>
                  <div className="flex justify-center">
                    <span className={`px-4 py-1 rounded-full text-[9px] font-black text-black uppercase ${service.status === 'CONCLUIDO' ? 'bg-green-400' :
                      service.status === 'PENDENTE' ? 'bg-yellow-400' : 'bg-blue-400'
                      }`}>
                      {service.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex justify-end gap-6 font-black text-[10px] uppercase">
                    <Link to={`/servicos/${service.id}`} className="text-indigo-600 hover:text-indigo-800 cursor-pointer">Detalhes</Link>
                    <button onClick={() => handleDeleteService(service.id)} className="text-red-300 hover:text-red-600 cursor-pointer">Excluir</button>
                  </div>
                </div>
              );
            })}
            {services.length === 0 && <p className="text-center py-10 text-gray-400 text-xs font-bold uppercase">Nenhum serviço encontrado com esse filtro.</p>}
          </div>
        )}

        {/* PAGINAÇÃO COM PULO DIRETO */}
        <div className="flex justify-between items-center mt-10 pt-4 border-t border-gray-100 font-black uppercase text-xs">
          <button
            onClick={() => setCurrentPage(p => p - 1)}
            disabled={!previousPageUrl || loading}
            className={`text-blue-600 transition-all ${!previousPageUrl || loading ? 'text-gray-300' : 'cursor-pointer hover:px-2'}`}
          >
            {"<"} Anterior
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
            className={`text-blue-600 transition-all ${!nextPageUrl || loading ? 'text-gray-300' : 'cursor-pointer hover:px-2'}`}
          >
            Próximo {">"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServicePage;