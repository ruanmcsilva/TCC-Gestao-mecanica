import React, { useState, useEffect, useCallback } from 'react';
import api from '../api/api';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { 
  ArrowLeft, Printer, Edit, Trash2, Plus, 
  Package, Camera, FileText, User, Calendar, X, Clock, CheckCircle, Search, CreditCard,
  QrCode, Banknote, Smartphone
} from 'lucide-react';
import Select from 'react-select';

const ServiceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [service, setService] = useState<any>(null);
  const [client, setClient] = useState<any>(null);
  const [moto, setMoto] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedService, setEditedService] = useState<any>(null);
  const [serviceParts, setServiceParts] = useState<any[]>([]);
  const [allParts, setAllParts] = useState<any[]>([]);
  const [uploadedPhotos, setUploadedPhotos] = useState<any[]>([]);
  
  // Estados para Pagamento
  const [showPagamento, setShowPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [parcelas, setParcelas] = useState(1);
  const [vendaSucesso, setVendaSucesso] = useState(false);

  const [newPart, setNewPart] = useState({ 
    peca: 0, 
    quantidade_utilizada: 1, 
    valor_unitario_na_epoca: 0,
    estoque_atual: 0 
  });
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      height: '65px',
      borderRadius: '12px',
      border: 'none',
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      fontWeight: '700',
      fontSize: '14px',
      backgroundColor: 'white',
      cursor: 'pointer'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#2563eb' : state.isFocused ? '#eff6ff' : 'white',
      color: state.isSelected ? 'white' : '#1e40af',
      fontWeight: '600',
      fontSize: '13px',
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: '#9ca3af',
      fontSize: '13px',
      fontWeight: '600'
    })
  };

  const fetchDetails = useCallback(async () => {
    setLoading(true);
    try {
      const [serviceResponse, partsResponse, allPartsResponse, photosResponse] = await Promise.all([
        api.get(`/servicos/${id}/`),
        api.get(`/itens-servico/?servico=${id}`),
        api.get('/pecas/?page_size=1000'),
        api.get(`/fotos/?servico=${id}`),
      ]);

      const serviceData = serviceResponse.data;
      setService(serviceData);
      setEditedService(serviceData);
      setServiceParts(partsResponse.data.results || []);
      setAllParts(allPartsResponse.data.results || []);
      setUploadedPhotos(photosResponse.data.results || []);

      // AJUSTE: Só busca a moto se o ID existir para evitar erro 404/null
      const [clientResponse, motoResponse] = await Promise.all([
        api.get(`/clientes/${serviceData.cliente}/`),
        serviceData.moto 
          ? api.get(`/motos/${serviceData.moto}/`) 
          : Promise.resolve({ data: { modelo: 'NÃO INFORMADA', placa: '---' } })
      ]);
      setClient(clientResponse.data);
      setMoto(motoResponse.data);
    } catch (err) {
      showNotification('Erro ao carregar detalhes.', 'error');
    } finally {
      setLoading(false);
    }
  }, [id, showNotification]);

  useEffect(() => { fetchDetails(); }, [fetchDetails]);

  const pecasOptions = allParts.map(p => ({
    value: p.id,
    label: `${p.nome} - Est: ${p.quantidade_em_estoque || 0}`,
    preco: parseFloat(p.preco_venda || 0),
    estoque: parseInt(p.quantidade_em_estoque || 0)
  }));

  const handlePartChange = (option: any) => {
    if (option) {
      setNewPart({
        ...newPart,
        peca: option.value,
        valor_unitario_na_epoca: option.preco,
        estoque_atual: option.estoque
      });
    } else {
      setNewPart({ ...newPart, peca: 0, estoque_atual: 0, valor_unitario_na_epoca: 0 });
    }
  };

  const handleUpdateStatus = async (status: string) => {
    try {
      await api.patch(`/servicos/${id}/`, { status });
      await fetchDetails();
      showNotification('Status atualizado!', 'success');
    } catch { showNotification('Erro ao mudar status.', 'error'); }
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/servicos/${id}/`, editedService);
      setIsEditing(false);
      await fetchDetails();
      showNotification('Dados atualizados!', 'success');
    } catch { showNotification('Erro ao salvar alterações.', 'error'); }
  };

  const handleDeleteService = async () => {
    if (window.confirm('Excluir esta OS permanentemente?')) {
      try {
        await api.delete(`/servicos/${id}/`);
        navigate('/servicos');
        showNotification('Serviço excluído.', 'success');
      } catch { showNotification('Erro ao excluir.', 'error'); }
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPart.peca === 0) {
      showNotification('Selecione uma peça primeiro.', 'info');
      return;
    }
    try {
      await api.post('/itens-servico/', { 
        servico: Number(id),
        peca: newPart.peca,
        quantidade_utilizada: newPart.quantidade_utilizada,
        valor_unitario_na_epoca: newPart.valor_unitario_na_epoca
      });
      setNewPart({ peca: 0, quantidade_utilizada: 1, valor_unitario_na_epoca: 0, estoque_atual: 0 });
      await fetchDetails();
      showNotification('Peça adicionada!', 'success');
    } catch { showNotification('Erro ao adicionar peça.', 'error'); }
  };

  const handleDeletePart = async (partId: number) => {
    if (window.confirm('Remover peça?')) {
      try {
        await api.delete(`/itens-servico/${partId}/`);
        await fetchDetails();
        showNotification('Peça removida.', 'success');
      } catch { showNotification('Erro ao remover.', 'error'); }
    }
  };

  const handlePrintOS = async () => {
    try {
      const response = await api.get(`/servicos/${id}/imprimir_os/`, { responseType: 'blob' });
      const fileURL = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      window.open(fileURL, '_blank');
    } catch { showNotification('Erro ao gerar PDF.', 'error'); }
  };

  const finalizarPagamentoOS = async () => {
    setLoading(true);
    try {
      const response = await api.post('/vendas/emitir-nota/', {
        venda_id: id,
        pagamento: metodoPagamento
      });

      if (response.status === 201 || response.status === 200) {
        const urlDanfe = response.data.url_danfe;
        const whatsappLink = response.data.whatsapp_link; // Captura o link do Zap
        
        setVendaSucesso(true);
        showNotification('Pagamento confirmado!', 'success');
        
        if (urlDanfe) {
           window.open(urlDanfe, '_blank');
        }

        // AJUSTE: Abre o WhatsApp com os detalhes da finalização
        if (whatsappLink) {
          window.open(whatsappLink, '_blank');
        }

        setTimeout(async () => {
          await fetchDetails(); 
          setShowPagamento(false);
          setVendaSucesso(false);
        }, 1500);
      }
    } catch (err) {
      showNotification('Erro ao processar pagamento.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('servico', String(id));
    formData.append('foto', selectedFile);
    try {
      await api.post('/fotos/', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSelectedFile(null);
      await fetchDetails();
      showNotification('Foto enviada!', 'success');
    } catch { showNotification('Erro no upload.', 'error'); }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONCLUIDO': return 'bg-green-600 text-white';
      case 'EM_ANDAMENTO': return 'bg-blue-600 text-white';
      case 'PENDENTE': return 'bg-amber-500 text-white';
      case 'CANCELADO': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  if (loading || !service) return <div className="p-10 text-center font-bold text-gray-500 uppercase tracking-widest animate-pulse">Sincronizando oficina...</div>;

  return (
    <div className="p-6 bg-[#f8fafc] min-h-screen font-sans">
      
      {/* HEADER */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/servicos')} className="p-2 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all cursor-pointer"><ArrowLeft size={22}/></button>
          <div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">OS #{id}</h1>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Responsável: {service?.responsavel_nome || 'Mecânico Admin'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-200 border border-gray-100 transition-all cursor-pointer">
            <Edit size={16}/> EDITAR
          </button>
          
          <button onClick={handlePrintOS} className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-bold text-xs hover:bg-gray-200 border border-gray-100 transition-all cursor-pointer">
            <Printer size={16}/> IMPRIMIR
          </button>

          {service?.status !== 'CONCLUIDO' ? (
            <button 
              onClick={() => setShowPagamento(true)}
              className="flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-xl font-black text-xs hover:bg-orange-600 shadow-md transition-all cursor-pointer"
            >
              <CreditCard size={16}/> PAGAR AGORA
            </button>
          ) : (
            <div className="flex items-center gap-2 bg-green-100 text-green-700 px-6 py-2 rounded-xl font-black text-xs border border-green-200 uppercase">
              <CheckCircle size={16}/> OS FINALIZADA
            </div>
          )}
          
          <div className="h-8 w-[1px] bg-gray-200 mx-2"></div>

          <select 
            value={service?.status} 
            disabled={service?.status === 'CONCLUIDO'}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className={`px-4 py-2 rounded-xl font-black text-xs uppercase outline-none shadow-md transition-all border-none ${
              service?.status === 'CONCLUIDO' ? 'bg-green-600 text-white opacity-100' : getStatusColor(service?.status)
            } ${service?.status === 'CONCLUIDO' ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value="PENDENTE">🟡 PENDENTE</option>
            <option value="EM_ANDAMENTO">🔵 EM ANDAMENTO</option>
            <option value="CONCLUIDO">🟢 CONCLUÍDO</option>
            <option value="CANCELADO">🔴 CANCELADO</option>
          </select>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-800 uppercase mb-6 flex items-center gap-3 border-b pb-4">
              <FileText size={22} className="text-amber-500"/> Detalhamento Técnico
            </h2>

            {isEditing ? (
              <form onSubmit={handleUpdateService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="text-xs font-bold text-gray-400 uppercase">Descrição do Serviço</label>
                  <textarea className="w-full p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl mt-2 focus:border-amber-500 outline-none transition-all font-medium" rows={3} value={editedService?.descricao} onChange={e => setEditedService({...editedService, descricao: e.target.value})}/>
                </div>
                <input type="number" className="p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold" value={editedService?.kilometragem} placeholder='Km' onChange={e => setEditedService({...editedService, kilometragem: Number(e.target.value)})}/>
                <input type="number" step="0.01" className="p-4 bg-gray-50 border-2 border-gray-100 rounded-xl font-bold" value={editedService?.valor_mao_de_obra} placeholder='Valor mão de obra' onChange={e => setEditedService({...editedService, valor_mao_de_obra: e.target.value})}/>
                <div className="md:col-span-2 flex gap-4">
                  <button type="submit" className="bg-amber-500 text-white px-8 py-3 rounded-xl font-black text-xs cursor-pointer">SALVAR</button>
                  <button type="button" onClick={() => setIsEditing(false)} className="bg-gray-100 text-gray-500 px-8 py-3 rounded-xl font-bold text-xs cursor-pointer">CANCELAR</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 bg-gray-50 p-6 rounded-2xl border-l-8 border-amber-500">
                  <p className="text-lg font-bold text-gray-700 leading-relaxed">{service?.descricao}</p>
                </div>
                <div className="grid grid-cols-2 gap-6 md:col-span-2 border-t border-gray-50 pt-6">
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><User size={12}/> Responsável</p>
                      <p className="text-sm font-black text-gray-900 uppercase">{service?.responsavel_nome || 'Admin'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Calendar size={12}/> Aberto em</p>
                      <p className="text-sm font-bold text-gray-700">{new Date(service?.data_inicio).toLocaleString()}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><CheckCircle size={12}/> Conclusão</p>
                      <p className="text-sm font-bold text-gray-700">{service?.data_fim ? new Date(service.data_fim).toLocaleString() : '---'}</p>
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase mb-1 flex items-center gap-1"><Clock size={12}/> KM Atual</p>
                      <p className="text-sm font-black text-gray-900">{service?.kilometragem} KM</p>
                   </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-800 uppercase mb-6 flex items-center gap-3">
              <Package size={22} className="text-blue-500"/> Peças Utilizadas
            </h2>
            
            <form onSubmit={handleAddPart} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-blue-50 p-5 rounded-xl border border-blue-100 shadow-inner">

              <div className="flex flex-col justify-end">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-1 ml-1 tracking-wider">
                  Selecionar Peça
                </label>
                <Select
                  options={pecasOptions}
                  placeholder="Pesquisar peça..."
                  styles={customSelectStyles}
                  isClearable
                  isSearchable
                  value={pecasOptions.find(opt => opt.value === newPart.peca)}
                  onChange={handlePartChange}
                  noOptionsMessage={() => "Nenhuma peça encontrada"}
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-1 ml-1 tracking-wider text-center">
                  Valores e Estoque
                </label>
                <div className="bg-white/80 rounded-xl px-5 border border-blue-200 shadow-sm flex items-center justify-around h-[65px]">
                  {newPart.peca !== 0 ? (
                    <>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Preço</p>
                        <p className="text-lg font-black text-blue-800 leading-none">
                          R$ {Number(newPart.valor_unitario_na_epoca || 0).toFixed(2)}
                        </p>
                      </div>
                      <div className="h-8 w-[1px] bg-blue-100"></div>
                      <div className="text-center">
                        <p className="text-[9px] font-black text-gray-400 uppercase">Estoque</p>
                        <p className={`text-lg font-black leading-none ${
                          newPart.estoque_atual < 5 ? 'text-red-500 animate-pulse' : 'text-green-600'
                        }`}>
                          {newPart.estoque_atual} <span className="text-[10px]">un</span>
                        </p>
                      </div>
                    </>
                  ) : (
                    <p className="text-[11px] text-gray-400 font-bold italic uppercase">Aguardando seleção</p>
                  )}
                </div>
              </div>

              <div className="flex flex-col justify-end">
                <label className="text-[10px] font-black text-blue-600 uppercase mb-1 ml-1 tracking-wider">
                  Quantidade
                </label>
                <input 
                  type="number" 
                  className="w-full px-4 rounded-lg border-none font-black text-2xl shadow-sm text-blue-700 outline-none h-[65px] bg-white text-center" 
                  value={newPart.quantidade_utilizada} 
                  onChange={e => setNewPart({...newPart, quantidade_utilizada: Number(e.target.value)})}
                  min="1"
                />
              </div>

              <div className="flex flex-col justify-end">
                <label className="text-[10px] opacity-0 mb-1">Espaçador</label>
                <button 
                  type="submit" 
                  className="w-full bg-blue-600 text-white font-black rounded-xl text-sm hover:bg-blue-700 transition-all shadow-md shadow-blue-200 uppercase tracking-[0.2em] h-[65px] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Plus size={18}/> LANÇAR PEÇA
                </button>
              </div>

            </form>

            <div className="space-y-2">
              {serviceParts.map(item => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-gray-100 rounded-xl bg-white hover:bg-gray-50 transition-all no-print">
                  <div>
                    <span className="font-bold text-gray-800 text-sm italic">
                      {allParts.find(p => p.id === item.peca)?.nome}
                    </span>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">
                      {item.quantidade_utilizada} unidade(s)
                    </p>
                  </div>
                  <div className="flex items-center gap-5">
                    <span className="font-black text-gray-800 text-lg">
                      R$ {(item.quantidade_utilizada * Number(item.valor_unitario_na_epoca)).toFixed(2)}
                    </span>
                    <button onClick={() => handleDeletePart(item.id)} className="text-red-200 hover:text-red-500 transition-colors cursor-pointer">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900 text-white rounded-[32px] p-8 shadow-xl border-b-8 border-amber-500">
            <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Cliente / Moto</h2>
            <div className="mb-8">
              <p className="text-3xl font-black leading-tight">{client?.nome}</p>
              <p className="text-amber-500 font-bold">{client?.telefone}</p>
            </div>
            <div className="pt-5 border-t border-gray-800">
              <p className="text-xl font-bold">{moto?.modelo}</p>
              <p className="text-4xl font-black text-white mt-1 uppercase tracking-tighter">{moto?.placa}</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-gray-800 uppercase mb-6 border-b pb-4 text-center">Resumo de Valores</h2>
            <div className="space-y-4">
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Mão de Obra</span>
                <span className="text-gray-900 font-black">R$ {Number(service?.valor_mao_de_obra).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-400 uppercase">
                <span>Total Peças</span>
                <span className="text-gray-900 font-black">R$ {Number(service?.valor_total_pecas).toFixed(2)}</span>
              </div>
              <div className="pt-6 border-t-2 border-dashed border-gray-100 flex justify-between items-center">
                <span className="font-black text-gray-400 text-[10px] uppercase">Total OS</span>
                <span className="text-3xl font-black text-amber-500">R$ {Number(service?.valor_total_servico).toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xs font-black text-gray-800 uppercase flex items-center gap-2">
                <Camera className="text-purple-500" size={18}/> Galeria
              </h2>
              <label className="cursor-pointer bg-purple-50 text-purple-600 p-2 rounded-full hover:bg-purple-100">
                <Plus size={18}/>
                <input type="file" className="hidden" onChange={e => setSelectedFile(e.target.files?.[0] || null)} />
              </label>
            </div>
            
            {selectedFile && (
              <button onClick={handleUploadPhoto} className="w-full bg-purple-600 text-white font-black py-2 rounded-xl mb-4 text-[10px] cursor-pointer">ENVIAR FOTO</button>
            )}

            <div className="grid grid-cols-2 gap-3">
              {uploadedPhotos.map(photo => (
                <img key={photo.id} src={photo.foto} className="w-full h-24 object-cover rounded-2xl shadow-sm border border-gray-100" alt="OS"/>
              ))}
            </div>
          </div>

          <button onClick={handleDeleteService} className="w-full py-4 bg-red-50 text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-100 cursor-pointer transition-colors">
            Excluir Ordem de Serviço
          </button>
        </div>
      </div>

      {/* MODAL DE PAGAMENTO (ESTILO PDV) */}
      {showPagamento && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999] flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            {!vendaSucesso ? (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center text-white border-b border-white/5 pb-4">
                  <h2 className="text-xl font-black uppercase tracking-tighter">Finalizar OS #{id}</h2>
                  <button onClick={() => setShowPagamento(false)} className="text-gray-500 hover:text-white cursor-pointer"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[
                    {id: 'PIX', i: <QrCode size={18}/>}, 
                    {id: 'CARTÃO', i: <CreditCard size={18}/>}, 
                    {id: 'DÉBITO', i: <Smartphone size={18}/>}, 
                    {id: 'DINHEIRO', i: <Banknote size={18}/>}
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMetodoPagamento(m.id)}
                      className={`p-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 border-2 transition-all cursor-pointer ${
                        metodoPagamento === m.id ? 'border-orange-500 bg-orange-500 text-black shadow-lg shadow-orange-500/20' : 'border-white/5 text-gray-500 bg-white/5'
                      }`}
                    >
                      {m.i} {m.id}
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 p-6 rounded-3xl min-h-[160px] flex flex-col justify-center items-center border border-white/5 transition-all">
                  {metodoPagamento === 'PIX' && (
                    <div className="text-center animate-in fade-in zoom-in duration-300">
                      <QrCode size={120} className="mx-auto text-white opacity-80" />
                      <p className="text-[10px] mt-4 text-orange-500 font-black uppercase tracking-widest animate-pulse">Aguardando confirmação do PIX...</p>
                    </div>
                  )}

                  {metodoPagamento === 'CARTÃO' && (
                    <div className="w-full space-y-4 animate-in slide-in-from-bottom-4 duration-300">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Escolha o Parcelamento</label>
                      <select 
                        value={parcelas} 
                        onChange={(e) => setParcelas(Number(e.target.value))} 
                        className="w-full p-4 bg-black rounded-xl border border-white/10 text-white font-bold outline-none focus:border-orange-500"
                      >
                        {[1, 2, 3, 6, 12].map(n => (
                          <option key={n} value={n}>
                            {n}x de R$ {(Number(service?.valor_total_servico) / n).toFixed(2)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {metodoPagamento === 'DÉBITO' && (
                    <div className="text-center animate-in zoom-in duration-300">
                      <Smartphone size={60} className="mx-auto text-white opacity-40 mb-3" />
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Insira ou aproxime o cartão na maquininha</p>
                    </div>
                  )}

                  {metodoPagamento === 'DINHEIRO' && (
                    <div className="text-center animate-in zoom-in duration-300">
                      <Banknote size={60} className="mx-auto text-white opacity-40 mb-3" />
                      <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Receba o valor em espécie e confirme abaixo</p>
                    </div>
                  )}
                </div>

                <div className="bg-white/5 p-4 rounded-2xl flex justify-between items-center border border-white/5">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total da OS</span>
                  <span className="text-2xl font-black text-white italic tracking-tighter">R$ {Number(service?.valor_total_servico).toFixed(2)}</span>
                </div>

                <button 
                  onClick={finalizarPagamentoOS} 
                  disabled={loading}
                  className="w-full p-6 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-orange-500 hover:text-white shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? "SINCRO..." : "Finalizar e Concluir OS"}
                </button>
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-6 animate-in zoom-in duration-500">
                <CheckCircle size={100} className="text-green-500 animate-bounce" />
                <div>
                  <h3 className="text-3xl font-black text-white uppercase tracking-tighter italic">Sucesso!</h3>
                  <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 animate-pulse">Sincronizando faturamento...</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetailsPage;