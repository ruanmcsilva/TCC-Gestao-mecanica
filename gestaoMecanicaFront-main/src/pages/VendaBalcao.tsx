import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { 
  Trash2, 
  CreditCard, 
  X,
  Zap,
  Percent,
  MinusCircle,
  QrCode,
  Banknote,
  Smartphone,
  CheckCircle2 
} from 'lucide-react';
import Select from 'react-select';

const VendaBalcao: React.FC = () => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [loading, setLoading] = useState(false);
  const [allParts, setAllParts] = useState<any[]>([]);
  const [selectedParts, setSelectedParts] = useState<{ peca: number; quantidade: number; preco: number; nome: string }[]>([]);
  
  const [descontoValor, setDescontoValor] = useState<number>(0);
  const [descontoPerc, setDescontoPerc] = useState<number>(0);

  const [showPagamento, setShowPagamento] = useState(false);
  const [metodoPagamento, setMetodoPagamento] = useState('PIX');
  const [parcelas, setParcelas] = useState(1);
  const [vendaSucesso, setVendaSucesso] = useState(false);

  useEffect(() => {
    api.get('/pecas/?page_size=1000').then(res => setAllParts(res.data.results));
  }, []);

  const pecasOptions = allParts.map(p => ({
    value: p.id,
    label: `${p.nome} (R$ ${p.preco_venda})`,
    preco: parseFloat(p.preco_venda || 0),
    nome: p.nome
  }));

  const handleAddPart = (option: any) => {
    if (!option) return;
    const jaExiste = selectedParts.find(p => p.peca === option.value);
    if (jaExiste) {
      updateQuantidade(option.value, jaExiste.quantidade + 1);
    } else {
      setSelectedParts([...selectedParts, { 
        peca: option.value, 
        quantidade: 1, 
        preco: option.preco, 
        nome: option.nome 
      }]);
    }
  };

  const updateQuantidade = (id: number, novaQtd: number) => {
    if (novaQtd < 1) return;
    setSelectedParts(selectedParts.map(p => 
      p.peca === id ? { ...p, quantidade: novaQtd } : p
    ));
  };

  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
  };

  const subtotalGeral = selectedParts.reduce((acc, curr) => acc + (curr.preco * curr.quantidade), 0);
  const totalComDesconto = Math.max(0, subtotalGeral - descontoValor);

  const handleDescontoValor = (valor: number) => {
    setDescontoValor(valor);
    setDescontoPerc(subtotalGeral > 0 ? (valor / subtotalGeral) * 100 : 0);
  };

  const handleDescontoPerc = (perc: number) => {
    setDescontoPerc(perc);
    setDescontoValor(subtotalGeral > 0 ? (perc / 100) * subtotalGeral : 0);
  };

  const selectStyles = {
    control: (base: any) => ({
      ...base,
      backgroundColor: '#1a1a1a',
      border: 'none',
      borderRadius: '1rem',
      padding: '5px',
      color: 'white',
    }),
    input: (base: any) => ({ ...base, color: 'white' }),
    placeholder: (base: any) => ({ ...base, color: 'white', opacity: 1, fontSize: '14px' }),
    singleValue: (base: any) => ({ ...base, color: 'white', fontWeight: 'bold' }),
    menu: (base: any) => ({ ...base, backgroundColor: '#1a1a1a', border: '1px solid #333' }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? '#f97316' : '#1a1a1a',
      color: state.isFocused ? 'black' : 'white',
      fontWeight: 'bold',
    }),
  };

  const handleAbrirCheckout = () => {
    if (selectedParts.length === 0) {
      showNotification('Adicione itens para pagar.', 'info');
      return;
    }
    setShowPagamento(true);
  };

  // FUNÇÃO ÚNICA E CORRIGIDA PARA O BACKEND
  const confirmarVendaFinal = async () => {
    setLoading(true);
    try {
      const dadosVenda = {
        cliente_nome: 'CONSUMIDOR PADRAO',
        cliente_cpf: '', 
        itens: selectedParts.map(p => ({
          codigo: p.peca,
          nome: p.nome,
          quantidade: p.quantidade,
          valor_unitario: p.preco,
          ncm: "8708.99.90",
          cfop: "5102"
        })),
        pagamento: metodoPagamento,
        desconto: descontoValor
      };

      const vendaRes = await api.post('/vendas/emitir-nota/', dadosVenda);

      setVendaSucesso(true);
      showNotification('Venda autorizada na SEFAZ!', 'success');
      
      setTimeout(() => {
        if (vendaRes.data.url_danfe) {
          window.open(vendaRes.data.url_danfe, '_blank');
        }

        navigate('/venda-balcao');
        setSelectedParts([]); 
        setShowPagamento(false);
        setVendaSucesso(false);
        setLoading(false);
        setDescontoValor(0);
        setDescontoPerc(0);
      }, 1500);

    } catch (err) {
      showNotification('Erro na autorização fiscal.', 'error');
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-6xl bg-[#141414] rounded-[3rem] shadow-2xl overflow-hidden border border-white/5">
        
        {/* HEADER */}
        <div className="p-8 flex justify-between items-center border-b border-white/5 bg-[#1a1a1a]">
          <div className="flex items-center gap-4">
            <div className="bg-orange-500 p-2 rounded-xl text-white">
              <Zap size={24} fill="white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-white uppercase tracking-tighter">
                Venda <span className="text-orange-500">Rápida</span>
              </h1>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.4em]">Mecânica Space</p>
            </div>
          </div>
          <button onClick={() => navigate('/')} className="text-white hover:text-orange-500 transition-all cursor-pointer p-2">
            <X size={28} />
          </button>
        </div>

        {/* BUSCA */}
        <div className="p-6 bg-[#1a1a1a]/50 border-b border-white/5">
          <label className="text-[10px] font-black text-white uppercase tracking-widest ml-1 mb-2 block">Localizar item no estoque</label>
          <Select
            options={pecasOptions}
            placeholder="O que o cliente está levando?"
            styles={selectStyles}
            onChange={handleAddPart}
            value={null}
          />
        </div>

        {/* TABELA */}
        <div className="p-8 min-h-[300px]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-white uppercase tracking-widest border-b border-white/10">
                  <th className="pb-6 text-left">Produto</th>
                  <th className="pb-6 text-center w-32">Quantidade</th>
                  <th className="pb-6 text-right">Preço</th>
                  <th className="pb-6 text-right">Subtotal</th>
                  <th className="pb-6 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {selectedParts.map((item, index) => (
                  <tr key={index} className="group hover:bg-white/5 transition-all">
                    <td className="py-5 text-base font-bold text-white uppercase italic tracking-tight">{item.nome}</td>
                    <td className="py-5 text-center">
                      <input 
                        type="number" 
                        value={item.quantidade} 
                        onChange={(e) => updateQuantidade(item.peca, Number(e.target.value))}
                        className="w-16 bg-white/10 border border-white/10 rounded-lg py-1 px-2 text-center font-black text-orange-500 focus:border-orange-500 outline-none"
                      />
                    </td>
                    <td className="py-5 text-right text-sm font-bold text-gray-400">R$ {item.preco.toFixed(2)}</td>
                    <td className="py-5 text-right text-lg font-black text-orange-500">R$ {(item.preco * item.quantidade).toFixed(2)}</td>
                    <td className="py-5 text-right">
                      <button onClick={() => removePart(index)} className="bg-white/5 p-2 rounded-lg text-white hover:bg-red-600 transition-all cursor-pointer">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* RODAPÉ */}
        <div className="p-8 bg-[#1a1a1a] border-t border-white/5">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8">
            <div className="flex gap-4 items-end">
                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-white uppercase tracking-widest">Desconto R$</label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-white">R$</span>
                        <input 
                            type="text" 
                            inputMode="decimal" 
                            value={descontoValor || ''}
                            onChange={(e) => handleDescontoValor(Number(e.target.value.replace(/[^0-9.]/g, '')))}
                            className="bg-white/5 border border-white rounded-xl py-3 pl-8 pr-4 w-28 font-bold text-white placeholder-white focus:border-orange-500 outline-none transition-all"
                            placeholder="0,00"
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[9px] font-black text-white uppercase tracking-widest">Desconto %</label>
                    <div className="relative">
                        <Percent size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-white pointer-events-none" />
                        <input 
                            type="text" 
                            inputMode="numeric" 
                            value={descontoPerc || ''}
                            onChange={(e) => handleDescontoPerc(Number(e.target.value.replace(/\D/g, '')))}
                            className="bg-white/5 border border-white rounded-xl py-3 pl-4 pr-10 w-24 font-bold text-white placeholder-white focus:border-orange-500 outline-none transition-all"
                            placeholder="0"
                        />
                    </div>
                </div>
                
                {(descontoValor > 0 || descontoPerc > 0) && (
                    <button 
                        type="button"
                        onClick={() => {setDescontoValor(0); setDescontoPerc(0);}}
                        className="mb-1 p-3 text-white hover:text-red-500 transition-colors cursor-pointer"
                    >
                        <MinusCircle size={20} />
                    </button>
                )}
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8 w-full md:w-auto">
              <div className="text-right">
                {descontoValor > 0 && (
                  <p className="text-[10px] font-bold text-gray-600 uppercase line-through mb-1">Subtotal: R$ {subtotalGeral.toFixed(2)}</p>
                )}
                <p className="text-[9px] font-black text-orange-500 uppercase tracking-[0.3em] mb-1">Total Final</p>
                <h2 className="text-3xl font-black text-white tracking-tighter leading-none">
                  R$ {totalComDesconto.toFixed(2)}
                </h2>
              </div>

              <button 
                type="button"
                onClick={handleAbrirCheckout}
                disabled={loading || selectedParts.length === 0}
                className={`
                  w-full md:w-auto px-10 py-5 rounded-2xl font-black text-lg uppercase tracking-wider
                  flex items-center justify-center gap-3 transition-all duration-300 cursor-pointer shadow-xl
                  ${loading || selectedParts.length === 0
                    ? 'bg-white/5 text-gray-700 cursor-not-allowed' 
                    : 'bg-orange-500 text-white hover:bg-orange-600 hover:-translate-y-1 active:scale-95 shadow-orange-500/20'
                  }
                `}
              >
                {loading ? (
                  <span className="animate-pulse text-sm tracking-widest">SINCRO...</span>
                ) : (
                  <>
                    <CreditCard size={22} className="text-white" strokeWidth={2.5} /> 
                    <span className="text-white">Pagar</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE PAGAMENTO */}
      {showPagamento && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1a1a1a] w-full max-w-lg rounded-[2.5rem] border border-white/10 overflow-hidden shadow-2xl">
            {!vendaSucesso ? (
              <div className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-black uppercase text-white tracking-tighter">Checkout</h2>
                  <button type="button" onClick={() => setShowPagamento(false)} className="text-gray-500 hover:text-white cursor-pointer"><X size={24}/></button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {[{id: 'PIX', i: <QrCode size={16}/>}, {id: 'CARTÃO', i: <CreditCard size={16}/>}, {id: 'DÉBITO', i: <Smartphone size={16}/>}, {id: 'DINHEIRO', i: <Banknote size={16}/>}].map(m => (
                    <button
                      type="button"
                      key={m.id}
                      onClick={() => setMetodoPagamento(m.id)}
                      className={`p-4 rounded-2xl font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border-2 transition-all cursor-pointer ${
                        metodoPagamento === m.id ? 'border-orange-500 bg-orange-500 text-black' : 'border-white/5 text-gray-500'
                      }`}
                    >
                      {m.i} {m.id}
                    </button>
                  ))}
                </div>

                <div className="bg-white/5 p-6 rounded-3xl min-h-[160px] flex flex-col justify-center border border-white/5">
                  {metodoPagamento === 'PIX' && <div className="text-center"><QrCode size={100} className="mx-auto opacity-20 text-white" /><p className="text-[9px] mt-2 text-gray-500 font-black uppercase">Aguardando...</p></div>}
                  {metodoPagamento === 'CARTÃO' && (
                    <select value={parcelas} onChange={(e) => setParcelas(Number(e.target.value))} className="w-full p-4 bg-black rounded-xl border border-white/10 text-white font-bold outline-none">
                      {[1,2,3,6,12].map(n => <option key={n} value={n}>{n}x de R$ {(totalComDesconto/n).toFixed(2)}</option>)}
                    </select>
                  )}
                </div>

                <button type="button" onClick={confirmarVendaFinal} className="w-full p-6 bg-white text-black font-black rounded-2xl uppercase tracking-[0.2em] hover:bg-orange-500 shadow-xl transition-all">
                  {loading ? "PROCESSANDO..." : "Finalizar e Emitir Nota"}
                </button>
              </div>
            ) : (
              <div className="p-20 text-center flex flex-col items-center gap-6">
                <CheckCircle2 size={80} className="text-green-500 animate-bounce" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Sucesso!</h3>
                <p className="text-gray-500 text-xs font-bold uppercase animate-pulse">Venda Sincronizada com SEFAZ...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VendaBalcao;