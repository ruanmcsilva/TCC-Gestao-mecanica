import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import Sidebar from './Sidebar';
import api from '../api/api';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [pendentes, setPendentes] = useState(0);
  const navigate = useNavigate();

  // Função para buscar a quantidade de solicitações pendentes
  const fetchPendentes = async () => {
    try {
      const response = await api.get('convites/pendentes/contagem/');
      setPendentes(response.data.pendentes);
    } catch (error) {
      console.error("Erro ao buscar contagem de solicitações:", error);
    }
  };

  useEffect(() => {
    fetchPendentes();
    // Atualiza a cada 30 segundos para manter o ADM informado em tempo real
    const interval = setInterval(fetchPendentes, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar /> 

      <div className="flex flex-col flex-grow">
        {/* Header com o Ícone de Notificação */}
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-end px-8 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            
            {/* Ícone de Exclamação com Badge */}
            <button 
              onClick={() => navigate('/solicitacoes')}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all group"
              title="Solicitações de Acesso"
            >
              <AlertCircle 
                size={26} 
                className={pendentes > 0 ? "text-amber-500" : "text-gray-400"} 
              />
              
              {pendentes > 0 && (
                <>
                  {/* Bolinha Vermelha com número */}
                  <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                    {pendentes}
                  </span>
                  {/* Efeito de pulso para chamar atenção */}
                  <span className="absolute top-1 right-1 h-5 w-5 bg-red-600 rounded-full animate-ping opacity-75"></span>
                </>
              )}
            </button>
          </div>
        </header>

        <main className="flex-grow p-6">
          {children}
        </main>

        <footer className="bg-white border-t border-gray-200 text-gray-500 p-4 text-center text-sm">
          <p>&copy; 2026 Sistema de Gestão de Mecânica. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;