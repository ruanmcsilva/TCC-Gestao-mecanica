import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { Save, X, User, Bike, Wrench, Package, Camera, Trash2 } from 'lucide-react';
import Select from 'react-select'; 

const NewServiceIntegrated: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [allParts, setAllParts] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    nome: '', 
    cpf_cnpj: '', 
    telefone: '', 
    endereco: '', 
    cep: '',
    marca: '', 
    modelo: '', 
    placa: '', 
    ano: new Date().getFullYear(),
    descricao: '', 
    kilometragem: '', 
    data_inicio: new Date().toISOString().slice(0, 16),
    profissional: '', 
  });

  const [selectedParts, setSelectedParts] = useState<{ peca: number; quantidade: number; preco: number; nome: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      padding: '8px',
      borderRadius: '1rem',
      border: 'none',
      backgroundColor: '#f9fafb', 
      boxShadow: 'none',
      fontWeight: '700',
      cursor: 'pointer'
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#9333ea' : state.isFocused ? '#f3e8ff' : 'white',
      color: state.isSelected ? 'white' : '#6b21a8',
      fontWeight: '600',
    }),
  };

  useEffect(() => {
    api.get('/pecas/?page_size=1000').then(res => setAllParts(res.data.results));
  }, []);

  const pecasOptions = allParts.map(p => ({
    value: p.id,
    label: `${p.nome} - R$ ${p.preco_venda} (Est: ${p.quantidade_em_estoque || 0})`,
    preco: p.preco_venda,
    nome: p.nome
  }));

  const handleCEPBlur = async (cepValue: string) => {
    const cep = cepValue.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await api.get(`/consulta/cep/${cep}/`); 
        const data = response.data;
        if (data) {
          const rua = (data.logradouro || data.street || '').replace(/"/g, '');
          const bairro = (data.bairro || data.neighborhood || '').replace(/"/g, '');
          const cidade = (data.localidade || data.city || '').replace(/"/g, '');
          const uf = (data.uf || data.state || '').replace(/"/g, '');
          const enderecoLimpo = [rua, bairro, cidade].filter(Boolean).join(', ') + (uf ? ` - ${uf}` : '');
          setFormData(prev => ({ ...prev, endereco: enderecoLimpo, cep: cep }));
          showNotification('Endereço preenchido!', 'success');
        }
      } catch (err) {
        showNotification('CEP não encontrado.', 'error');
      }
    }
  };

  const handleCPFBlur = async (cpfValue: string) => {
    const cpf = cpfValue.replace(/\D/g, '');
    if (cpf.length === 11) {
      try {
        await api.get(`/consulta/cpf/${cpf}/`);
        showNotification('CPF validado!', 'success');
      } catch (err) {
        showNotification('CPF não encontrado.', 'info');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPart = (option: any) => {
    if (!option) return;
    setSelectedParts([...selectedParts, { 
      peca: option.value, 
      quantidade: 1, 
      preco: option.preco, 
      nome: option.nome 
    }]);
  };

  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const clientRes = await api.post('/clientes/', {
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        telefone: formData.telefone,
        endereco: formData.endereco,
      });

      const motoRes = await api.post('/motos/', {
        cliente: clientRes.data.id,
        marca: formData.marca,
        modelo: formData.modelo,
        placa: formData.placa.toUpperCase(),
        ano: formData.ano
      });

      const serviceRes = await api.post('/servicos/', {
        cliente: clientRes.data.id,
        moto: motoRes.data.id,
        descricao: formData.descricao,
        kilometragem: formData.kilometragem,
        data_inicio: formData.data_inicio,
        profissional: formData.profissional,
        status: 'PENDENTE'
      });

      const serviceId = serviceRes.data.id;

      if (selectedParts.length > 0) {
        await Promise.all(selectedParts.map(p => 
          api.post('/itens-servico/', {
            servico: serviceId,
            peca: p.peca,
            quantidade_utilizada: p.quantidade,
            valor_unitario_na_epoca: p.preco
          })
        ));
      }

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const photoData = new FormData();
          photoData.append('servico', String(serviceId));
          photoData.append('foto', file);
          await api.post('/fotos/', photoData, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          });
        }
      }

      showNotification('O.S. Integrada gerada com sucesso!', 'success');
      navigate(`/servicos/${serviceId}`);
    } catch (err) {
      showNotification('Erro na gravação. Verifique CPF ou Placa.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gray-50 h-full overflow-y-auto flex flex-col font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter flex items-center gap-3">
            <Wrench className="text-orange-500" /> Nova Entrada Integrada
          </h1>
          <button onClick={() => navigate('/')} className="p-2 hover:bg-red-50 rounded-full cursor-pointer transition-all"><X /></button>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-6">
          
          <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
            <h2 className="text-xs font-black text-blue-600 uppercase tracking-widest mb-6 flex items-center gap-2"><User size={18}/> 1. Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input type="text" name="nome" placeholder="Nome Completo" value={formData.nome} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
              <input type="text" name="cpf_cnpj" placeholder="CPF" value={formData.cpf_cnpj} onChange={handleInputChange} onBlur={(e) => handleCPFBlur(e.target.value)} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" />
              <input type="text" name="telefone" placeholder="WhatsApp" value={formData.telefone} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-blue-500" required />
              
              <div className="md:col-span-3 flex flex-col md:flex-row gap-4">
                <input type="text" name="cep" placeholder="CEP" value={formData.cep} onChange={handleInputChange} onBlur={(e) => handleCEPBlur(e.target.value)} className="w-full md:w-1/4 p-4 bg-blue-50 border-2 border-blue-100 rounded-2xl font-black text-blue-700 outline-none" />
                <input type="text" name="endereco" placeholder="Endereço Automático" value={formData.endereco} onChange={handleInputChange} className="flex-1 p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-orange-500 uppercase tracking-widest mb-6 flex items-center gap-2"><Bike size={18}/> 2. Veículo</h2>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" name="marca" placeholder="Marca (Ex: Honda)" value={formData.marca} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" required />
                <input type="text" name="modelo" placeholder="Modelo (Ex: Biz)" value={formData.modelo} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" required />
                <input type="text" name="placa" placeholder="PLACA" value={formData.placa} onChange={handleInputChange} className="p-4 bg-gray-900 text-white border-none rounded-2xl font-black text-center uppercase text-xl" required />
                <input type="number" name="ano" placeholder="Ano" value={formData.ano} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col gap-4">
              <h2 className="text-xs font-black text-green-600 uppercase tracking-widest mb-6 flex items-center gap-2"><Wrench size={18}/> 3. Ordem de Serviço</h2>
              
              <select name="profissional" value={formData.profissional} onChange={handleInputChange} className="w-full p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none focus:ring-2 focus:ring-green-500 cursor-pointer" required>
                <option value="">--- Selecione o Profissional ---</option>
                <option value="Ruan">Ruan (Mestre)</option>
                <option value="Joao">João Paulo</option>
                <option value="Carlos">Carlos Mecânico</option>
              </select>

              <div className="grid grid-cols-2 gap-4">
                <input type="number" name="kilometragem" placeholder="KM Atual" value={formData.kilometragem} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" required />
                <input type="datetime-local" name="data_inicio" value={formData.data_inicio} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-bold outline-none" required />
              </div>
              <textarea name="descricao" placeholder="Relato do defeito..." value={formData.descricao} onChange={handleInputChange} className="p-4 bg-gray-50 border-none rounded-2xl font-medium outline-none h-20" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-purple-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Package size={18}/> 4. Peças</h2>
              
              <Select
                options={pecasOptions}
                placeholder="Pesquisar peça..."
                styles={customSelectStyles}
                isSearchable
                noOptionsMessage={() => "Peça não encontrada"}
                onChange={handleAddPart}
                value={null} 
              />

              <div className="mt-6 max-h-48 overflow-y-auto space-y-2 pr-2">
                {selectedParts.map((p, i) => (
                  <div key={i} className="flex justify-between items-center bg-purple-50 p-3 rounded-xl border border-purple-100 transition-all">
                    <span className="text-xs font-black text-purple-700">{p.nome} (R$ {p.preco})</span>
                    <button type="button" onClick={() => removePart(i)} className="text-red-400 hover:text-red-600 cursor-pointer transition-colors">
                      <Trash2 size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
              <h2 className="text-xs font-black text-pink-600 uppercase tracking-widest mb-4 flex items-center gap-2"><Camera size={18}/> 5. Fotos da Entrada</h2>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-3xl cursor-pointer hover:bg-gray-50 transition-all">
                <Camera size={32} className="text-gray-300 mb-2" />
                <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">Clique para anexar fotos</p>
                <input type="file" multiple className="hidden" onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))} />
              </label>
              <p className="mt-2 text-center text-[10px] font-black text-pink-500 uppercase">{selectedFiles.length} arquivos selecionados</p>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className={`
              w-full mt-10 p-6 rounded-[2rem] font-black text-xl tracking-widest uppercase
              flex items-center justify-center gap-4 transition-all duration-300 cursor-pointer
              ${loading 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-orange-500 via-orange-600 to-red-600 text-white shadow-[0_10px_40px_-10px_rgba(249,115,22,0.5)] hover:shadow-[0_20px_50px_-10px_rgba(249,115,22,0.7)] hover:-translate-y-1 active:scale-95'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Sincronizando...</span>
              </div>
            ) : (
              <>
                <Save size={28} className="drop-shadow-md" />
                <span className="drop-shadow-md">Finalizar e Gerar O.S.</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewServiceIntegrated;