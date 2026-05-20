// src/App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Importa os componentes das páginas
import LoginPage from './pages/Login';
import HomePage from './pages/Home';
import ClientPage from './pages/ClientPage'; 
import MotoPage from './pages/MotoPage';
import ServicePage from './pages/ServicePage';
import ServiceDetailsPage from './pages/ServiceDetailsPage';
import PartPage from './pages/PartPage';
import ReportsPage from './pages/ReportsPage';
import ClientHistoryPage from './pages/ClientHistoryPage';
import SolicitacoesScreen from './components/SolicitacoesScreen';
import ConfiguracoesPage from './pages/ConfiguracoesPage';
import NewServiceIntegrated from './pages/NewServiceIntegrated';
import VendaBalcao from './pages/VendaBalcao';
import AgendamentosPage from './pages/AgendamentosPage';
import CadastroTokenScreen from './pages/CadastroTokenScreen';
import EmployeeHistoryPage from './pages/EmployeeHistoryPage';

// IMPORTAÇÃO DO CHAT DE IA
import AIChatWidget from './components/AIChatWidget'; 

import Layout from './components/Layout';
import { NotificationProvider } from './contexts/NotificationContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';

interface AuthProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(
    !!localStorage.getItem('access_token') 
  );

  useEffect(() => {
    // Logica para validar o token ao iniciar
  }, []);

  const ProtectedRoutes = () => {
    const { isAdmin, isLoading } = useAuth();

    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }

    if (isLoading) {
      return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Carregando permissões...</div>;
    }

    return (
      <Layout setIsAuthenticated={setIsAuthenticated}>
        <Routes>
          <Route path="/" element={<HomePage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/clientes" element={<ClientPage />} />
          <Route path="/motos" element={<MotoPage />} />
          <Route path="/servicos" element={<ServicePage />} />
          <Route path="/servicos/:id" element={<ServiceDetailsPage />} />
          <Route path="/pecas" element={<PartPage />} />
          {isAdmin && <Route path="/relatorios" element={<ReportsPage />} />}
          <Route path="/clientes/:id/historico" element={<ClientHistoryPage />} />
          {isAdmin && <Route path="/solicitacoes" element={<SolicitacoesScreen />} />}
          <Route path="/configuracoes" element={<ConfiguracoesPage/>} />
          <Route path="/servicos/novo" element={<NewServiceIntegrated />} />
          <Route path="/venda-balcao" element={<VendaBalcao />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
          
          {/* Rota para páginas restritas para não-admins */}
          {!isAdmin && <Route path="/relatorios" element={<Navigate to="/" replace />} />}
          {!isAdmin && <Route path="/solicitacoes" element={<Navigate to="/" replace />} />}
          {!isAdmin && <Route path="/historico" element={<EmployeeHistoryPage />} />}
        </Routes>
        
        <AIChatWidget /> 
      </Layout>
    );
  };

  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/cadastro-token" element={<CadastroTokenScreen />} />
            <Route path="/*" element={<ProtectedRoutes />} />
          </Routes>
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;