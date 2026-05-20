// src/components/Layout.tsx
import React, { ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Calendar } from 'lucide-react'; // Adicionado Calendar
import Sidebar from './Sidebar';
import AIChatWidget from './AIChatWidget';
import api from '../api/api';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  children: ReactNode;
  setIsAuthenticated: (auth: boolean) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, setIsAuthenticated }) => {
  const [pendentes, setPendentes] = useState(0);
  const [agendamentosHoje, setAgendamentosHoje] = useState(0); // Estado para agendamentos do dia
  const [funcionarioNome, setFuncionarioNome] = useState("Carregando...");
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const fetchData = async () => {
    try {
      if (isAdmin) {
        // Busca contagem de convites pendentes apenas se for admin
        const resConvites = await api.get('convites/pendentes/contagem/');
        setPendentes(resConvites.data.pendentes);
      }

      // Busca agendamentos de hoje usando a action que criamos no Django
      const resAgendamentos = await api.get('agendamento/hoje/');
      setAgendamentosHoje(resAgendamentos.data.length);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
    }
  };

  const fetchUsuario = async () => {
    try {
      const response = await api.get('/auth/user/');
      setFuncionarioNome(response.data.first_name || "Ruan Matheus");
    } catch (error) {
      setFuncionarioNome("Ruan Matheus");
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsuario();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar setIsAuthenticated={setIsAuthenticated} />

      <div className="flex flex-col flex-grow">
        <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-30">

          <div className="text-gray-600 font-medium">
            Funcionário: <span className="text-black font-bold">{funcionarioNome}</span>
          </div>

          <div className="flex items-center gap-4">
            {/* ÍCONE DE AGENDAMENTOS DO DIA */}
            <button
              onClick={() => navigate('/agendamentos')}
              className="relative p-2 rounded-full hover:bg-gray-100 transition-all group"
              title="Agendamentos de Hoje"
            >
              <Calendar
                size={26}
                className={agendamentosHoje > 0 ? "text-blue-500" : "text-gray-400"}
              />

              {agendamentosHoje > 0 && (
                <>
                  <span className="absolute top-1 right-1 bg-blue-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                    {agendamentosHoje}
                  </span>
                </>
              )}
            </button>

            {/* ÍCONE DE SOLICITAÇÕES DE ACESSO */}
            {isAdmin && (
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
                    <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm z-10">
                      {pendentes}
                    </span>
                    <span className="absolute top-1 right-1 h-5 w-5 bg-red-600 rounded-full animate-ping opacity-75"></span>
                  </>
                )}
              </button>
            )}
          </div>
        </header>

        <main className="flex-grow p-4 md:p-6 md:pb-2 overflow-hidden flex flex-col">
          {children}
        </main>


      </div>
    </div>
  );
};

export default Layout;