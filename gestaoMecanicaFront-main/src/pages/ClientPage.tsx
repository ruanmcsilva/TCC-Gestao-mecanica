import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useNavigate, Link } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';

interface ClientData {
  id: number;
  nome: string;
  telefone: string;
  email: string;
  cpf_cnpj: string;
  endereco: string;
}

const ClientPage: React.FC = () => {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [newClient, setNewClient] = useState<Omit<ClientData, 'id'>>({
    nome: '', telefone: '', email: '', cpf_cnpj: '', endereco: '',
  });
  const [editingClient, setEditingClient] = useState<ClientData | null>(null);
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [inputPage, setInputPage] = useState<string>('1');
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [previousPageUrl, setPreviousPageUrl] = useState<string | null>(null);

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  // --- FUNÇÃO DE MÁSCARA PARA SEGURANÇA ---
  const maskCPF = (value: string) => {
    if (!value) return '---';
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length === 11) {
      // Mascara CPF: 123.***.***-00
      return `${cleanValue.substring(0, 3)}.***.***-${cleanValue.substring(9)}`;
    } else if (cleanValue.length === 14) {
      // Mascara CNPJ: 12.***.*** / ****-00
      return `${cleanValue.substring(0, 2)}.***.***/****-${cleanValue.substring(12)}`;
    }
    return value;
  };

  const fetchData = useCallback(async (page: number, search?: string) => {
    setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      const response = await api.get(`/clientes/`, { params });
      
      setClients(response.data.results);
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

  const handleCEPBlur = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await api.get(`/consulta/cep/${cep}/`);
        const enderecoCompleto = `${response.data.street || ''}, ${response.data.neighborhood || ''}, ${response.data.city || ''} - ${response.data.state || ''}`;
        if (editingClient) setEditingClient({ ...editingClient, endereco: enderecoCompleto });
        else setNewClient(prev => ({ ...prev, endereco: enderecoCompleto }));
        showNotification('Endereço preenchido!', 'success');
      } catch (err) { showNotification('CEP não encontrado.', 'error'); }
    }
  };

  const handleCPFBlur = async (cpfValue: string) => {
    const cpf = cpfValue.replace(/\D/g, '');
    if (cpf.length === 11) {
      try {
        await api.get(`/consulta/cpf/${cpf}/`);
        showNotification('Documento válido!', 'success');
      } catch (err) { showNotification('Documento inválido.', 'error'); }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (editingClient) setEditingClient({ ...editingClient, [name]: value });
    else setNewClient({ ...newClient, [name]: value });
  };

const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Capturamos a resposta do servidor para pegar o link do WhatsApp
      const response = await api.post('/clientes/', newClient);
      
      setNewClient({ nome: '', telefone: '', email: '', cpf_cnpj: '', endereco: '' });
      setIsFormVisible(false);
      setCurrentPage(1); 
      showNotification('Cliente adicionado!', 'success');

      // VERIFICAÇÃO DO LINK DO WHATSAPP (Backend configurado)
      if (response.data.whatsapp_link) {
        window.open(response.data.whatsapp_link, '_blank');
      }
      
    } catch (err) { 
      showNotification('Erro ao adicionar.', 'error'); 
    }
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient) return;
    try {
      await api.put(`/clientes/${editingClient.id}/`, editingClient);
      setEditingClient(null);
      setIsFormVisible(false);
      fetchData(currentPage, searchTerm);
      showNotification('Cliente atualizado!', 'success');
    } catch (err) { showNotification('Erro ao atualizar.', 'error'); }
  };

  const handleDeleteClient = async (id: number) => {
    if (window.confirm('Excluir cliente?')) {
      try {
        await api.delete(`/clientes/${id}/`);
        fetchData(currentPage, searchTerm);
        showNotification('Excluído.', 'success');
      } catch (err) { showNotification('Erro ao excluir.', 'error'); }
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans">
      
      <div className="flex justify-between items-center mb-8">
        <div className="relative w-2/3">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
            <svg className="h-5 w-5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Pesquisar por nome, CPF ou telefone..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg bg-white focus:outline-none shadow-sm font-medium"
          />
        </div>

        <button
          onClick={() => { setIsFormVisible(!isFormVisible); setEditingClient(null); }}
          className="bg-orange-500 rounded-full p-2.5 hover:bg-orange-600 shadow-md transition-colors cursor-pointer"
        >
          <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isFormVisible ? "M6 18L18 6M6 6l12 12" : "M12 4v16m8-8H4"} />
          </svg>
        </button>
      </div>

      {isFormVisible && (
        <div className="bg-white shadow-lg rounded-xl p-6 mb-8 border-t-4 border-orange-500">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={editingClient ? handleUpdateClient : handleAddClient} className="grid grid-cols-2 gap-4">
            <input type="text" name="nome" placeholder="Nome" value={(editingClient ? editingClient.nome : newClient.nome) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none focus:ring-1 focus:ring-orange-500 font-bold" required />
            <input type="text" name="telefone" placeholder="Telefone" value={(editingClient ? editingClient.telefone : newClient.telefone) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none" required />
            <input type="email" name="email" placeholder="Email" value={(editingClient ? editingClient.email : newClient.email) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none" />
            
            {/* CPF COM MÁSCARA AO EDITAR - Mas aceita digitação nova */}
            <input 
              type="text" 
              name="cpf_cnpj" 
              placeholder="CPF/CNPJ" 
              value={(editingClient ? editingClient.cpf_cnpj : newClient.cpf_cnpj) || ''} 
              onChange={handleInputChange} 
              onBlur={(e) => handleCPFBlur(e.target.value)} 
              className="p-2 border rounded border-amber-200 outline-none focus:ring-1 focus:ring-orange-500" 
            />

            <input type="text" placeholder="CEP (Auto-preencher endereço)" onBlur={(e) => handleCEPBlur(e.target.value)} className="p-2 border rounded bg-blue-50 border-blue-200 outline-none cursor-text" />
            <input type="text" name="endereco" placeholder="Endereço" value={(editingClient ? editingClient.endereco : newClient.endereco) || ''} onChange={handleInputChange} className="p-2 border rounded outline-none font-medium" />
            
            <div className="col-span-2 flex justify-end gap-2 mt-2">
              <button type="button" onClick={() => setIsFormVisible(false)} className="px-4 py-2 bg-gray-400 text-white rounded font-bold uppercase text-xs cursor-pointer hover:bg-gray-500 transition-colors">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded font-bold uppercase text-xs cursor-pointer hover:bg-green-700 transition-colors">{editingClient ? 'Atualizar Dados' : 'Salvar Cliente'}</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-orange-500 uppercase tracking-wide">Lista de Clientes</h2>
        </div>

        <div className="grid grid-cols-4 gap-4 pb-3 px-2 text-gray-700 font-bold text-sm text-center">
          <div className="text-left">Nome</div>
          <div>Contato</div>
          <div>CPF/CNPJ (Protegido)</div>
          <div className="text-right">Ações</div>
        </div>
        <div className="h-[1px] bg-black w-full mb-2"></div>

        {loading ? <p className="text-center py-10 text-gray-500 font-bold uppercase text-xs">Buscando dados...</p> : (
          <div className="divide-y divide-gray-50">
            {clients.length > 0 ? clients.map(client => (
              <div 
                key={client.id} 
                className="grid grid-cols-4 gap-4 items-center px-2 py-4 hover:bg-blue-50 transition-colors text-center"
              >
                <div className="text-gray-900 font-bold text-left uppercase text-[11px]">{client.nome}</div>
                <div className="text-sm text-gray-600 font-bold">{client.telefone || client.email}</div>
                
                {/* AQUI ESTÁ A MÁSCARA NA LISTAGEM */}
                <div className="text-sm text-gray-400 font-mono italic">
                  {maskCPF(client.cpf_cnpj)}
                </div>

                <div className="flex justify-end gap-6 font-black text-[10px] uppercase">
                  <button onClick={() => { setEditingClient(client); setIsFormVisible(true); }} className="text-yellow-600 hover:text-yellow-700 cursor-pointer">Editar</button>
                  <Link to={`/clientes/${client.id}/historico`} className="text-indigo-600 hover:text-indigo-700 cursor-pointer">Histórico</Link>
                  <button onClick={() => handleDeleteClient(client.id)} className="text-red-300 hover:text-red-600 cursor-pointer">Excluir</button>
                </div>
              </div>
            )) : <p className="text-center py-4 text-gray-400">Nenhum cliente encontrado.</p>}
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

export default ClientPage;