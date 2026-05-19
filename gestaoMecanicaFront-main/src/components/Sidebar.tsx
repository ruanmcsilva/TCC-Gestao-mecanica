// src/components/Sidebar.tsx
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import { logout } from '../api/api'; 
import { useNotification } from '../contexts/NotificationContext';
import { 
  Home, 
  Users, 
  Bike, // Ajustado de Motorbike para Bike (padrão Lucide)
  HandPlatter,
  Cog,
  LogOut,
  FileText,
  Settings // Importado para Configurações
} from 'lucide-react';

interface SidebarProps {
  setIsAuthenticated: (auth: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ setIsAuthenticated }) => {
  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const handleLogout = () => {
    logout(); 
    setIsAuthenticated(false); 
    navigate('/login'); 
    showNotification('Você saiu do sistema com segurança.', 'success');
  };

  const menuItems = [
    { to: "/", label: "Início", icon: Home },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/motos", label: "Motos", icon: Bike },
    { to: "/servicos", label: "Serviços", icon: HandPlatter },
    { to: "/pecas", label: "Peças", icon: Cog },
    { to: "/relatorios", label: "Relatórios", icon: FileText },
    { to: "/configuracoes", label: "Configurações", icon: Settings }, // CORRIGIDO
  ];

  const baseClass = "flex items-center py-2 px-4 rounded transition duration-200 mb-2";

  return (
    <nav className="w-64 h-screen bg-black text-white flex flex-col flex-shrink-0 border-r border-black sticky top-0 shadow-xl">
      <div className="p-4">
        <div className='flex justify-center mb-6 mt-4 flex-shrink-0'>
          <img src={logo} alt="Logo" className='w-32 h-auto object-contain'/>
        </div>
        <hr className='border-t border-amber-500 -mx-4 opacity-100'/>
      </div>

      <ul className="flex-grow overflow-y-auto px-4 py-2 custom-scrollbar">
        {menuItems.map((item) => (
          <li key={item.to}>
            <NavLink 
              to={item.to} 
              className={({ isActive }) => 
                `${baseClass} ${isActive ? 'bg-amber-500 text-black font-bold' : 'text-white hover:bg-gray-700'}`
              }
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="p-4 mt-auto flex-shrink-0 border-t border-gray-900">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center py-2 px-4 rounded text-red-400 hover:bg-red-500 hover:text-white transition duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span className="font-bold">Sair</span>
        </button>
      </div>
    </nav>
  );
};

export default Sidebar;