// src/pages/Login.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import email from '../assets/email.svg';
import cadeado from '../assets/cadeado.svg';
import logo from '../assets/logo.png';
import abelha from '../assets/abelha.png';

// Importação dos Componentes (Modais)
import ContactModal from '../components/ContactModal'; 
import SuccessModal from '../components/SuccessModal'; 
import EsqueciSenha from '../components/EsqueciSenha';
import NovaSenha from '../components/NovaSenha';
import SuccessSenhaModal from '../components/SuccessSenhaModal'; // Importado novo modal

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

function LoginPage({ setIsAuthenticated }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Estados para controle de exibição dos Modais
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isEsqueciSenhaOpen, setIsEsqueciSenhaOpen] = useState(false);
  const [isNovaSenhaOpen, setIsNovaSenhaOpen] = useState(false);
  const [isSuccessSenhaOpen, setIsSuccessSenhaOpen] = useState(false); // Estado para sucesso de senha
  
  const navigate = useNavigate();

  // Função de Login Real
  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(username, password);
      setIsAuthenticated(true);
      navigate('/');
    } catch (err: any) {
      if (err.response && err.response.status === 401) {
        setError('Credenciais inválidas. Tente novamente.');
      } else {
        setError('Erro ao conectar com o servidor. Tente novamente mais tarde.');
      }
    }
  };

  // --- Funções de Fluxo dos Modais ---

  // Fluxo Criar Conta: Contato -> SuccessModal (O que tem o aviãozinho/Send)
  const handleContactSuccess = () => {
    setIsContactOpen(false);
    setIsSuccessOpen(true);
  };

  // Fluxo Esqueci Senha: E-mail -> Nova Senha
  const handleEsqueciSenhaSuccess = () => {
    setIsEsqueciSenhaOpen(false);
    setIsNovaSenhaOpen(true); 
  };

  // Fluxo Final Nova Senha: Nova Senha -> SuccessSenhaModal (O que tem o Check)
  const handleNovaSenhaSuccess = () => {
    setIsNovaSenhaOpen(false);
    setIsSuccessSenhaOpen(true);
  };

  return (
    <div className="flex min-h-screen relative">
      
      {/* 1. Lado Esquerdo: Imagem da Abelha */}
      <div className="hidden lg:flex lg:w-[65%] bg-white relative overflow-hidden">
        <img 
          src={abelha} 
          alt="abelha"  
          style={{
            width: '497px',
            height: '1038px',
            transform: 'rotate(3.26deg)',
            top: '50px',
            left: '-19px',
            position: 'absolute',
            opacity: 1
          }}
        />
      </div>

      {/* 2. Lado Direito: Formulário de Login */}
      <div className="w-full lg:w-[35%] flex items-center justify-center bg-black p-8">
        <div className="p-10 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center">
          
          <img src={logo} alt="Logo" className="w-32 h-auto mb-6" />
          
          <h2 className="text-2xl font-bold mb-8 text-left text-amber-500 w-full">Bem-vindo</h2>
          
          <form onSubmit={handleLogin} className="space-y-5 w-full">
            <div className='relative'>
              {!username && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={email} alt="User" className="w-5 h-5 opacity-50 " />
                </div>
              )}
              <input 
                placeholder='Login'
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`${!username ? 'pl-10' : 'px-3'} block w-full py-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm text-black placeholder-black`}
                required
              />
            </div>

            <div className='relative'>
              {!password && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={cadeado} alt="Lock" className="w-5 h-5 opacity-50" />
                </div>
              )}
              <input
                placeholder='Senha'
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${!password ? 'pl-10' : 'px-3'} block w-full py-3 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm text-black placeholder-black`}
                required
              />
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-amber-500 focus:ring-amber-500 border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2 block text-xs text-gray-400 cursor-pointer">
                  Lembrar de mim
                </label>
              </div>

              <div className="text-xs">
                <span 
                  onClick={() => setIsEsqueciSenhaOpen(true)} 
                  className="font-medium text-amber-500 hover:text-amber-400 cursor-pointer transition-colors"
                >
                  Esqueci minha senha
                </span>
              </div>
            </div>

            {error && <p className="text-red-500 text-sm text-center font-medium">{error}</p>}

            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-md text-sm font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
            >
              Entrar
            </button>

            <p className='mt-6 text-center text-xs text-gray-500'>
              Não tem conta? <span 
                onClick={() => setIsContactOpen(true)} 
                className='font-semibold text-amber-500 cursor-pointer hover:underline decoration-amber-500'
              >
                Entre em contato com o <br/>desenvolvedor
              </span>
            </p>
          </form>
        </div>
      </div>

      {/* 3. Renderização dos Modais */}
      
      {/* Modal Criar Conta */}
      <ContactModal 
        isOpen={isContactOpen} 
        onClose={() => setIsContactOpen(false)} 
        onSuccess={handleContactSuccess} 
      />

      {/* Modal E-mail de Recuperação */}
      <EsqueciSenha 
        isOpen={isEsqueciSenhaOpen}
        onClose={() => setIsEsqueciSenhaOpen(false)}
        onSuccess={handleEsqueciSenhaSuccess}
      />

      {/* Modal Redefinição de Senha */}
      <NovaSenha
        isOpen={isNovaSenhaOpen}
        onClose={() => setIsNovaSenhaOpen(false)}
        onSuccess={handleNovaSenhaSuccess}
      />

      {/* Modal Sucesso de Contato (Avião) */}
      <SuccessModal 
        isOpen={isSuccessOpen} 
        onClose={() => setIsSuccessOpen(false)} 
      />

      {/* Modal Sucesso de Senha (Check) */}
      <SuccessSenhaModal 
        isOpen={isSuccessSenhaOpen} 
        onClose={() => setIsSuccessSenhaOpen(false)} 
      />

    </div>
  );
}

export default LoginPage;