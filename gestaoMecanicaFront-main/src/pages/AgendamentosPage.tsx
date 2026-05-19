import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNotification } from '../contexts/NotificationContext';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Clock, User, MessageSquare, Plus, CheckCircle, XCircle, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const AgendamentosPage: React.FC = () => {
  const [agendamentos, setAgendamentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataSelecionada, setDataSelecionada] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const { showNotification } = useNotification();

  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [form, setForm] = useState({ cliente: '', moto: '', hora: '08:00', descricao: '' });

  const fetchAgendamentos = async () => {
    setLoading(true);
    try {
      const response = await api.get('agendamento/');
      const lista = response.data.results || response.data;
      setAgendamentos(lista);
    } catch (error) {
      showNotification('Erro ao carregar agenda.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchAuxiliares = async () => {
    const resCli = await api.get('clientes/');
    setClientes(resCli.data.results || resCli.data);
  };

  const handleClienteChange = async (clienteId: string) => {
    setForm({ ...form, cliente: clienteId });
    const resMotos = await api.get(`motos/?search=${clienteId}`);
    setMotos(resMotos.data.results || resMotos.data);
  };


  const salvarAgendamento = async () => {
    try {
      const payload = {
        cliente: form.cliente,
        moto: form.moto,
        data: dataSelecionada.toISOString().split('T')[0],
        hora: form.hora,
        descricao_problema: form.descricao,
        status: 'PENDENTE'
      };

      // Captura a resposta que agora contém o link gerado no backend
      const response = await api.post('agendamento/', payload);

      showNotification('Agendado com sucesso!', 'success');
      setShowModal(false);
      fetchAgendamentos();

      // Abre o WhatsApp de confirmação
      if (response.data.whatsapp_link) {
        window.open(response.data.whatsapp_link, '_blank');
      }

    } catch (error: any) {
      showNotification(error.response?.data?.erro || 'Erro ao agendar.', 'error');
    }
  };

  useEffect(() => {
    fetchAgendamentos();
    fetchAuxiliares();
  }, []);

  const agendamentosDoDia = agendamentos.filter(ag => {
    const dataAg = new Date(ag.data).toDateString();
    return dataAg === dataSelecionada.toDateString();
  });

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* HEADER CENTRALIZADO */}
      <div className="flex flex-col items-center text-center mb-8">
        <h1 className="text-3xl font-black text-gray-800 uppercase italic tracking-tighter">Agenda Técnica</h1>
        <p className="text-xs text-gray-400 font-bold uppercase mb-4">Controle de horários e produtividade</p>
        <button
          onClick={() => setShowModal(true)}
          className="bg-orange-500 text-white px-8 py-3 rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all shadow-lg flex items-center gap-2"
        >
          <Plus size={18} /> Novo Agendamento
        </button>
      </div>

      <div className="max-w-4xl mx-auto space-y-8">

        {/* CALENDÁRIO GRANDE E CENTRALIZADO */}
        <div className="bg-white p-4 md:p-8 rounded-[32px] shadow-sm border border-gray-100">
          <Calendar
            onChange={(val: any) => setDataSelecionada(val)}
            value={dataSelecionada}
            className="calendar-xl"
            tileClassName={({ date }) => {
              const temAg = agendamentos.some(ag => new Date(ag.data).toDateString() === date.toDateString());
              return temAg ? 'has-agendamento' : '';
            }}
          />
        </div>

        {/* LISTA DE PROGRAMAÇÃO ABAIXO */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-2">
            <CalendarIcon size={16} className="text-orange-500" />
            <h2 className="text-sm font-black text-gray-700 uppercase italic">
              Programação: {dataSelecionada.toLocaleDateString()}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {agendamentosDoDia.length > 0 ? agendamentosDoDia.map(ag => (
              <div key={ag.id} className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between group hover:border-orange-500 transition-all">
                <div className="flex items-center gap-4">
                  <div className="bg-orange-50 text-orange-600 w-12 h-12 flex items-center justify-center rounded-2xl font-black text-sm">
                    {ag.hora.slice(0, 5)}
                  </div>
                  <div>
                    <h4 className="font-black text-gray-900 uppercase text-xs">{ag.cliente_nome}</h4>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{ag.moto_modelo} • {ag.moto_placa}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase ${ag.status === 'CONFIRMADO' ? 'bg-blue-100 text-blue-600' : 'bg-amber-100 text-amber-600'}`}>
                    {ag.status}
                  </span>
                </div>
              </div>
            )) : (
              <div className="col-span-full bg-white py-12 rounded-3xl border-2 border-dashed border-gray-100 text-center">
                <p className="text-gray-400 font-black uppercase text-[10px]">Sem serviços para este dia.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ESTILOS PARA O CALENDÁRIO FICAR GIGANTE */}
      <style>{`
        .calendar-xl {
          width: 100% !important;
          border: none !important;
          font-family: inherit !important;
        }
        .react-calendar__navigation {
          margin-bottom: 20px !important;
        }
        .react-calendar__navigation button {
          font-weight: 900 !important;
          text-transform: uppercase !important;
          font-size: 16px !important;
        }
        .react-calendar__month-view__days__day {
          padding: 20px 10px !important; /* Aumenta o tamanho das células */
          font-weight: 700 !important;
        }
        .react-calendar__tile--active {
          background: #f97316 !important;
          border-radius: 12px !important;
        }
        .has-agendamento {
          color: #f97316 !important;
          position: relative;
        }
        .has-agendamento::after {
          content: '•';
          position: absolute;
          bottom: 5px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 18px;
        }
      `}</style>

      {/* MODAL MANTIDO IGUAL AO SEU */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-300">
            <h2 className="text-xl font-black text-gray-800 uppercase italic mb-6">Novo Agendamento</h2>
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Cliente</label>
                <select className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-orange-500" onChange={(e) => handleClienteChange(e.target.value)}>
                  <option value="">Selecione o Cliente</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Moto do Cliente</label>
                <select className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm outline-none focus:ring-2 ring-orange-500" onChange={(e) => setForm({ ...form, moto: e.target.value })} disabled={!form.cliente}>
                  <option value="">Selecione a Moto</option>
                  {motos.map(m => <option key={m.id} value={m.id}>{m.modelo} ({m.placa})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Data</label>
                  <input type="text" disabled value={dataSelecionada.toLocaleDateString()} className="w-full bg-gray-100 border-none rounded-xl p-3 font-bold text-sm" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Horário</label>
                  <input type="time" value={form.hora} onChange={(e) => setForm({ ...form, hora: e.target.value })} className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm outline-none" />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block">Descrição do Problema</label>
                <textarea className="w-full bg-gray-50 border-none rounded-xl p-3 font-bold text-sm h-24 outline-none focus:ring-2 ring-orange-500" placeholder="Ex: Troca de óleo..." onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
              </div>
            </div>
            <div className="flex gap-3 mt-8">
              <button onClick={() => setShowModal(false)} className="flex-grow py-3 text-gray-400 font-black uppercase text-xs hover:bg-gray-50 rounded-xl transition-all">Cancelar</button>
              <button onClick={salvarAgendamento} className="flex-grow py-3 bg-orange-500 text-white font-black uppercase text-xs rounded-xl shadow-lg hover:bg-orange-600 transition-all">Confirmar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendamentosPage;