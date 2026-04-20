// src/components/Layout.tsx

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';

// Define os tipos das propriedades (props) que o componente vai receber
interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // O flex principal para organizar Sidebar e Conteúdo
    <div className="flex min-h-screen">
      <Sidebar /> {/* <-- Adicione o Sidebar aqui */}
      
      {/* O resto do layout (cabeçalho, conteúdo principal, rodapé) */}
      <div className="flex flex-col flex-grow">
        <header className="">
          
        </header>
        <main className="flex-grow p-6">
          {children}
        </main>
        <footer className="bg-gray-200 text-white p-4 text-center text-sm">
          <p className='text-black'>&copy; 2025 Sistema de Gestão de Mecânica. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default Layout;