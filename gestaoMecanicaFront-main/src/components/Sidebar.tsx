// src/components/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import logo from '../assets/logo.png';
import { 
  Home, 
  Users, 
  Motorbike,
  HandPlatter,
  Cog,
  LogOut,
  FileText 
} from 'lucide-react';

const Sidebar: React.FC = () => {
  // 1. Definição dos itens do menu para evitar repetição
  const menuItems = [
    { to: "/", label: "Início", icon: Home },
    { to: "/clientes", label: "Clientes", icon: Users },
    { to: "/motos", label: "Motos", icon: Motorbike },
    { to: "/servicos", label: "Serviços", icon: HandPlatter },
    { to: "/pecas", label: "Peças", icon: Cog },
    { to: "/relatorios", label: "Relatórios", icon: FileText },
  ];

  

  const baseClass = "flex items-center py-2 px-4 rounded transition duration-200 mb-2";

  return (
    // h-screen + flex-col para o botão sair "grudar" no fundo
    <nav className="w-64 h-screen bg-black text-white flex flex-col flex-shrink-0 border-r border-black overflow-hidden">
      
      {/* TOPO: Logo fixa */}
      <div className="p-4">
        <div className='flex justify-center mb-6 mt-4'>
          <img src={logo} alt="Logo" className='w-32 h-auto object-contain'/>
        </div>
        <hr className='border-t border-amber-500 -mx-4 opacity-100'/>
      </div>

      {/* MEIO: Lista com rolagem independente */}
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

      {/* RODAPÉ: Botão Sair fixo */}
      <div className="p-4 mt-auto">
        <button 
          onClick={() => console.log('Logout clicado')}
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