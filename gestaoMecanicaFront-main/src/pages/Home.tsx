import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../api/api';
import api from '../api/api'; 
import { useNotification } from '../contexts/NotificationContext'; 
import { Wrench, ShoppingCart, AlertTriangle, PlayCircle, PlusCircle, Layers } from 'lucide-react';

interface HomePageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

interface DashboardData {
  services_in_progress_count: number;
  low_stock_parts_count: number;
  total_parts_count: number;
}

function HomePage({ setIsAuthenticated }: HomePageProps) {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null); 
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const { showNotification } = useNotification(); 

  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      try {
        const [servicesRes, lowStockRes, allPartsRes] = await Promise.all([
          api.get('/dashboard/services-in-progress/'),
          api.get('/dashboard/low-stock-parts/'),
          api.get('/pecas/?page_size=1'),
        ]);

        setDashboardData({
          services_in_progress_count: servicesRes.data.count,
          low_stock_parts_count: lowStockRes.data.count,
          total_parts_count: allPartsRes.data.count,
        });

      } catch (err: any) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
          setIsAuthenticated(false);
          navigate('/login');
        } else {
          showNotification('Erro ao carregar dados.', 'error'); 
        }
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, [navigate, setIsAuthenticated, showNotification]); 

  if (loading) {
    return <div className="p-10 text-center text-gray-400 font-black uppercase animate-pulse tracking-widest">Sincronizando Oficina...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans h-full flex flex-col justify-center overflow-y-auto w-full">
      
      {/* STATUS DO TOPO - Total de Peças em Destaque */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        
        {/* Serviços em Andamento */}
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-orange-500">
          <div className="flex items-center gap-3">
            <PlayCircle size={22} className="text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Em Andamento</span>
          </div>
          <span className="text-2xl font-black text-gray-900">{dashboardData?.services_in_progress_count}</span>
        </div>

        {/* Alertas de Estoque */}
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-red-500">
          <div className="flex items-center gap-3">
            <AlertTriangle size={22} className={dashboardData?.low_stock_parts_count ? "text-red-500" : "text-gray-300"} />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Estoque Baixo</span>
          </div>
          <span className="text-2xl font-black text-red-600">{dashboardData?.low_stock_parts_count}</span>
        </div>

        {/* TOTAL DE PEÇAS (Agora com destaque) */}
        <div className="bg-white px-6 py-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between border-l-4 border-l-blue-600">
          <div className="flex items-center gap-3">
            <Layers size={22} className="text-blue-600" />
            <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Total de Itens</span>
          </div>
          <span className="text-2xl font-black text-blue-700">{dashboardData?.total_parts_count}</span>
        </div>
      </div>

      {/* AÇÕES PRINCIPAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CARD: OFICINA (Vai direto para Nova OS) */}
        <div 
          onClick={() => navigate('/servicos/novo')} // <--- Redireciona direto para o formulário
          className="relative bg-white p-10 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl hover:border-orange-200 transition-all cursor-pointer group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="bg-orange-500 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <Wrench size={28} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Nova O.S.</h3>
              <p className="text-gray-500 font-medium leading-snug max-w-[240px]">
                Iniciar imediatamente um novo serviço de manutenção.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-orange-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
              <PlusCircle size={18} /> Começar Agora
            </div>
          </div>
        </div>

        {/* CARD: VENDA AVULSA */}
        <div 
          onClick={() => navigate('/venda-balcao')} 
          className="relative bg-white p-10 rounded-3xl shadow-md border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
        >
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div>
              <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <ShoppingCart size={28} className="text-white" />
              </div>
              <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tighter mb-2">Venda Balcão</h3>
              <p className="text-gray-500 font-medium leading-snug max-w-[240px]">
                Vender peças avulsas e consultar estoque disponível.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-2 text-blue-600 font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">
               Consultar Peças <PlusCircle size={18} />
            </div>
          </div>
        </div>

      </div>

      <div className="mt-16 text-center">
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.5em]">Terminal de Vendas e Oficina</p>
      </div>
    </div>
  );
}

export default HomePage;