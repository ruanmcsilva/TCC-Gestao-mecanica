import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../contexts/NotificationContext';
import { History, FileText, Hash, Calendar, User, Clock, ArrowRight, LayoutDashboard, TrendingUp, Printer } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

interface ReportData {
  mes: number;
  ano: number;
  servicos_concluidos_count: number;
  total_mao_de_obra: number;
  total_pecas_receita: number;
  total_custo_pecas: number;
  total_receita_bruta: number;
  total_lucro_bruto: number;
}

const ReportsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'relatorio' | 'dashboard' | 'historico'>('relatorio');
  const [history, setHistory] = useState<any[]>([]);
  const [report, setReport] = useState<ReportData | null>(null);
  const [dashData, setDashData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [periodo, setPeriodo] = useState<string>('mes');
  const [periodoDash, setPeriodoDash] = useState<string>('mes');

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const COLORS = ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6'];

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dashboard-analitico/?periodo=${periodoDash}`);
      setDashData(response.data);
    } catch (err) {
      showNotification('Erro ao carregar análise de dados.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchReport = async (e?: React.FormEvent, isManual: boolean = false) => {
    e?.preventDefault();
    setLoading(true);
    try {
      const response = await api.get(`/relatorio-financeiro/?mes=${selectedMonth}&ano=${selectedYear}&periodo=${periodo}`);
      setReport(response.data);

      if (isManual) {
        if (response.data.servicos_concluidos_count === 0) {
          showNotification('Sem serviços CONCLUÍDOS no período.', 'info');
        } else {
          showNotification('Relatório atualizado!', 'success');
        }
      }
    } catch (err: any) {
      if (err.response?.status === 401) navigate('/login');
      else showNotification('Erro ao gerar relatório.', 'error');
    } finally {
      setLoading(false);
    }
  };


  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicos/?status=CONCLUIDO&ordering=-data_fim');
      setHistory(response.data.results || []);
    } catch (err) {
      showNotification('Erro ao carregar histórico.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'relatorio') {
      handleFetchReport(undefined, false);
    } else if (activeTab === 'dashboard') {
      fetchDashboard();
    } else {
      fetchHistory();
    }
  }, [periodo, periodoDash, activeTab]);

  const formatCurrency = (val: number | undefined) => {
    return val !== undefined ? val.toFixed(2) : '0.00';
  };

  return (
    <div className="p-6 h-full overflow-y-auto font-sans flex flex-col">

      <div className="flex bg-white w-fit p-1 rounded-xl shadow-sm border border-gray-200 mb-8 no-print shrink-0">
        <button
          onClick={() => setActiveTab('relatorio')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'relatorio' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'
            }`}
        >
          <FileText size={16} /> Relatório
        </button>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'dashboard' ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'
            }`}
        >
          <LayoutDashboard size={16} /> Dashboard
        </button>
        <button
          onClick={() => setActiveTab('historico')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-black uppercase transition-all cursor-pointer ${activeTab === 'historico' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:bg-gray-50'
            }`}
        >
          <History size={16} /> Histórico
        </button>
      </div>

      {activeTab === 'dashboard' ? (

        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-black text-gray-800 uppercase italic flex items-center gap-3 tracking-tighter">
              Análise Inteligente <TrendingUp className="text-orange-500" />
            </h1>
            <div className="flex bg-white border rounded-lg p-1 shadow-sm no-print">
              {['dia', 'quinzena', 'mes', 'trimestral', '6meses', 'ano'].map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriodoDash(p)}
                  className={`px-3 py-1 rounded-md text-[10px] font-black uppercase transition-all cursor-pointer ${periodoDash === p ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                    }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <p className="text-center py-20 text-gray-400 font-black uppercase animate-pulse">Processando com Pandas...</p>
          ) : dashData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl border-l-4 border-blue-500 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Faturamento Total</p>
                  <p className="text-2xl font-black text-gray-900">R$ {dashData.kpis.faturamento_total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-green-500 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Lucro Estimado</p>
                  <p className="text-2xl font-black text-green-600">R$ {dashData.kpis.lucro_estimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border-l-4 border-orange-500 shadow-sm">
                  <p className="text-[10px] font-black text-gray-400 uppercase">Ticket Médio</p>
                  <p className="text-2xl font-black text-gray-900">R$ {dashData.kpis.ticket_medio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 italic tracking-widest">Evolução do Faturamento</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dashData.timeline}>
                        <defs><linearGradient id="colorF" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#f97316" stopOpacity={0.1} /><stop offset="95%" stopColor="#f97316" stopOpacity={0} /></linearGradient></defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="data_rotulo" fontSize={10} fontWeight="bold" stroke="#94a3b8" />
                        <YAxis fontSize={10} fontWeight="bold" stroke="#94a3b8" />
                        <Tooltip />
                        <Area type="monotone" dataKey="valor_total_calculado" stroke="#f97316" strokeWidth={3} fillOpacity={1} fill="url(#colorF)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 italic tracking-widest">Peças: Custo vs Venda</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashData.timeline}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis dataKey="data_rotulo" fontSize={10} fontWeight="bold" />
                        <YAxis fontSize={10} fontWeight="bold" />
                        <Tooltip />
                        <Legend iconType="circle" />
                        <Bar dataKey="total_custo_peca" name="Custo Compra" fill="#ef4444" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="total_venda_peca" name="Venda Receita" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 italic tracking-widest">Desempenho por Mecânico</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashData.funcionarios} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis dataKey="responsavel__username" type="category" fontSize={10} fontWeight="bold" width={80} />
                        <Tooltip />
                        <Bar dataKey="valor_total_calculado" radius={[0, 5, 5, 0]}>
                          {dashData.funcionarios.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase mb-6 italic tracking-widest">Métodos de Pagamento</h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={dashData.pagamentos} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="valor_total_calculado" nameKey="metodo_pagto">
                          {dashData.pagamentos.map((_: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend verticalAlign="bottom" iconType="circle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex justify-end no-print">
                <button onClick={() => window.print()} className="bg-gray-800 text-white px-8 py-3 rounded-xl font-black uppercase text-xs hover:bg-black transition-all flex items-center gap-2 shadow-lg cursor-pointer">
                  <Printer size={16} /> Imprimir Dashboard
                </button>
              </div>
            </>
          )}
        </div>
      ) : activeTab === 'relatorio' ? (
        <>
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 uppercase tracking-tight">Relatório Financeiro</h1>
            <form onSubmit={(e) => handleFetchReport(e, true)} className="flex gap-2 items-center">
              <div className="flex bg-white border rounded-lg p-1 shadow-sm mr-2">
                {(['mes', '6meses', 'ano'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriodo(p)}
                    className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all cursor-pointer ${periodo === p ? 'bg-orange-500 text-white shadow-md' : 'text-gray-400 hover:text-gray-600'
                      }`}
                  >
                    {p === 'mes' ? 'Mês' : p === '6meses' ? '6 Meses' : 'Ano'}
                  </button>
                ))}
              </div>
              {periodo === 'mes' && (
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-3 py-2 border rounded-lg bg-white font-bold text-gray-600 outline-none shadow-sm cursor-pointer hover:border-orange-500 transition-colors">
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>)}
                </select>
              )}
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-3 py-2 border rounded-lg bg-white font-bold text-gray-600 outline-none shadow-sm cursor-pointer hover:border-orange-500 transition-colors">
                {Array.from({ length: 5 }, (_, i) => { const year = new Date().getFullYear() - i; return <option key={year} value={year}>{year}</option> })}
              </select>

            </form>
          </div>

          {loading ? (
            <p className="text-center py-10 text-gray-400 font-bold uppercase animate-pulse">Consultando Banco de Dados...</p>
          ) : report ? (
            <>
              {report.servicos_concluidos_count > 0 && report.total_pecas_receita === 0 && (
                <div className="bg-red-50 border-2 border-red-200 p-4 rounded-xl mb-8 flex flex-col gap-2">
                  <span className="text-red-700 font-black uppercase text-xs">⚠️ Diagnóstico de Dados:</span>
                  <p className="text-red-600 text-sm font-medium">
                    Existem <strong>{report.servicos_concluidos_count}</strong> serviços concluídos, mas o valor das peças está <strong>R$ 0.00</strong>.
                  </p>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500">
                  <p className="text-xs font-bold text-gray-500 uppercase">Mão de Obra</p>
                  <p className="text-2xl font-black text-gray-900">R$ {formatCurrency(report.total_mao_de_obra)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-red-500">
                  <p className="text-xs font-bold text-gray-500 uppercase">Custo Peças</p>
                  <p className="text-2xl font-black text-gray-900">R$ {formatCurrency(report.total_custo_pecas)}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-tighter">Lucro Líquido Real</p>
                  <p className="text-2xl font-black text-green-600">R$ {formatCurrency(report.total_lucro_bruto)}</p>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100 mb-8">
                <h2 className="text-xl font-bold text-orange-500 uppercase mb-6 tracking-widest">Fluxo de Peças</h2>
                <div className="grid grid-cols-2 gap-4 pb-3 px-2 text-gray-400 font-black text-[10px] uppercase"><div>Movimentação</div><div className="text-right">Valor Total</div></div>
                <div className="h-[1px] bg-gray-100 w-full mb-4"></div>
                <div className="divide-y divide-gray-50 text-sm">
                  <div className="flex justify-between py-4 px-2"><span className="text-gray-700 font-bold uppercase text-xs">Venda das Peças (Receita)</span><span className="font-black text-gray-900">R$ {formatCurrency(report.total_pecas_receita)}</span></div>
                  <div className="flex justify-between py-4 px-2"><span className="text-gray-700 font-bold uppercase text-xs">Custo das Peças (Investimento)</span><span className="font-black text-red-500">- R$ {formatCurrency(report.total_custo_pecas)}</span></div>
                  <div className="flex justify-between py-4 px-2 bg-gray-50 rounded-lg mt-2"><span className="text-orange-600 font-black uppercase text-xs">Ganho sobre Peças</span><span className="font-black text-green-600">R$ {formatCurrency(report.total_pecas_receita - report.total_custo_pecas)}</span></div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-800 mb-4 uppercase text-xs">Resumo de Atividade</h2>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-4">
                  <span className="text-4xl font-black text-orange-500">{report.servicos_concluidos_count}</span>
                  <p className="text-xs font-bold text-gray-500 uppercase leading-tight">Ordens de Serviço Concluídas</p>
                </div>
                <p className="text-lg font-black text-gray-900 uppercase text-sm">Faturamento Bruto: <span className="text-2xl ml-2">R$ {formatCurrency(report.total_receita_bruta)}</span></p>
              </div>

              <div className="mt-8 flex justify-end no-print">
                <button onClick={() => window.print()} className="bg-gray-800 text-white px-6 py-2 rounded-lg font-bold hover:bg-black transition-all flex items-center gap-2 uppercase text-xs shadow-lg cursor-pointer">
                  Gerar PDF / Imprimir
                </button>
              </div>
            </>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">Aguardando definição de período para calcular...</p>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-[100%] mx-auto">

          <div className="overflow-y-auto max-h-[650px] custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  <th className="px-6 py-5 bg-gray-50"><Hash size={14} className="inline mr-1" /> ID</th>
                  <th className="px-6 py-5 bg-gray-50"><Calendar size={14} className="inline mr-1" /> Data e Hora</th>
                  <th className="px-6 py-5 bg-gray-50"><User size={14} className="inline mr-1" /> Mecânico Responsável</th>
                  <th className="px-6 py-5 text-right bg-gray-50">Ver Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="font-black text-gray-900 italic">#{item.id}</span>
                        <span className="text-gray-300">|</span>
                        {item.cliente_nome === "CONSUMIDOR PADRAO" || item.descricao?.includes("BALCÃO") ? <span className="text-[10px] font-black text-blue-600 uppercase">Venda Balcão</span> : <span className="text-[11px] font-black text-orange-600 uppercase">{item.cliente_nome}</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5"><span className="text-sm font-bold text-gray-700">{item.data_fim ? new Date(item.data_fim).toLocaleDateString() : '---'}</span></td>
                    <td className="px-6 py-5 text-sm font-black text-gray-600 uppercase">{item.responsavel_nome || 'Admin'}</td>
                    <td className="px-6 py-5 text-right"><button onClick={() => navigate(`/servicos/${item.id}`)} className="p-3 bg-gray-100 text-gray-400 rounded-lg hover:bg-orange-500 hover:text-white transition-all cursor-pointer"><ArrowRight size={20} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;