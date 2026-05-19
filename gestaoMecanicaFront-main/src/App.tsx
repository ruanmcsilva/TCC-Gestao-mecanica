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

// IMPORTAÇÃO DO CHAT DE IA
import AIChatWidget from './components/AIChatWidget'; 

import Layout from './components/Layout';
import { NotificationProvider } from './contexts/NotificationContext';

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
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
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
          <Route path="/relatorios" element={<ReportsPage />} />
          <Route path="/clientes/:id/historico" element={<ClientHistoryPage />} />
          <Route path="/solicitacoes" element={<SolicitacoesScreen />} />
          <Route path="/configuracoes" element={<ConfiguracoesPage/>} />
          <Route path="/servicos/novo" element={<NewServiceIntegrated />} />
          <Route path="/venda-balcao" element={<VendaBalcao />} />
          <Route path="/agendamentos" element={<AgendamentosPage />} />
        </Routes>
        
        <AIChatWidget /> 
      </Layout>
    );
  };

  return (
    <NotificationProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage setIsAuthenticated={setIsAuthenticated} />} />
          <Route path="/cadastro-token" element={<CadastroTokenScreen />} />
          <Route path="/*" element={<ProtectedRoutes />} />
        </Routes>
      </Router>
    </NotificationProvider>
  );
}

export default App;