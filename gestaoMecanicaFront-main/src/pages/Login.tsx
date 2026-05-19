// src/pages/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../api/api';
import email from '../assets/email.svg';
import cadeado from '../assets/cadeado.svg';
import logo from '../assets/logo.png';
import abelha from '../assets/abelha.png';
import { Eye, EyeOff, UserPlus, Key } from 'lucide-react'; 

// Importação dos Componentes (Modais)
import ContactModal from '../components/ContactModal'; 
import SuccessModal from '../components/SuccessModal'; 
import EsqueciSenha from '../components/EsqueciSenha';
import NovaSenha from '../components/NovaSenha';
import SuccessSenhaModal from '../components/SuccessSenhaModal';

interface LoginPageProps {
  setIsAuthenticated: (isAuthenticated: boolean) => void;
}

function LoginPage({ setIsAuthenticated }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false); 

  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isEsqueciSenhaOpen, setIsEsqueciSenhaOpen] = useState(false);
  const [isNovaSenhaOpen, setIsNovaSenhaOpen] = useState(false);
  const [isSuccessSenhaOpen, setIsSuccessSenhaOpen] = useState(false);
  
  const navigate = useNavigate();

  // Carrega apenas o E-mail se o "Lembrar de mim" estava ativo
  useEffect(() => {
    const savedUsername = localStorage.getItem('remembered_username');
    const savedRemember = localStorage.getItem('remember_me') === 'true';

    if (savedRemember && savedUsername) {
      setUsername(savedUsername);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    try {
      await login(username, password);

      // Lógica de Persistência Apenas para o Login
      if (rememberMe) {
        localStorage.setItem('remembered_username', username);
        localStorage.setItem('remember_me', 'true');
        // A senha NÃO é salva aqui por segurança
      } else {
        localStorage.removeItem('remembered_username');
        localStorage.setItem('remember_me', 'false');
      }

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

  const handleContactSuccess = () => {
    setIsContactOpen(false);
    setIsSuccessOpen(true);
  };

  const handleEsqueciSenhaSuccess = () => {
    setIsEsqueciSenhaOpen(false);
    setIsNovaSenhaOpen(true); 
  };

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
    
    {/* LOGO: Aumentada usando style para garantir que o CSS não bloqueie o tamanho */}
  <img 
  src={logo} 
  alt="Logo" 
  style={{
    width: '280px', // Aumentei ainda mais para garantir
    height: 'auto',
    marginBottom: '-10px' // Use valor negativo se quiser "colar" no Bem-vindo
  }}
  className="object-contain" // Remova a classe "logo" daqui se houver
/>
    
    {/* TÍTULO: Agora centralizado para alinhar com a logo maior */}
    <h2 className="text-3xl font-bold mb-8 text-left text-amber-500 w-full">
      Bem-vindo
    </h2>
    
    <form onSubmit={handleLogin} className="space-y-5 w-full">
            <div className='relative'>
              {!username && (
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <img src={email} alt="User" className="w-5 h-5 opacity-50 " />
                </div>
              )}
              <input 
                placeholder='E-mail'
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
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${!password ? 'pl-10' : 'px-3'} block w-full py-3 border bg-white border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm text-black placeholder-black`}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-500 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div className="flex items-center justify-between w-full">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
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

            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-800 w-full gap-2">
              <button
                type="button"
                onClick={() => setIsContactOpen(true)}
                className="flex flex-col items-center flex-1 group transition-all"
              >
                <div className="p-2 rounded-lg bg-gray-900 group-hover:bg-amber-500/10 mb-2 transition-colors">
                  <UserPlus size={18} className="text-amber-500" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 group-hover:text-amber-500 text-center leading-tight">
                  Falar com <br/> Desenvolvedor
                </span>
              </button>

              <div className="w-[1px] h-10 bg-gray-800" />

              <button
                type="button"
                onClick={() => navigate('/cadastro-token')}
                className="flex flex-col items-center flex-1 group transition-all"
              >
                <div className="p-2 rounded-lg bg-gray-900 group-hover:bg-amber-500/10 mb-2 transition-colors">
                  <Key size={18} className="text-amber-500" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-gray-500 group-hover:text-amber-500 text-center leading-tight">
                  Finalizar <br/> Cadastro
                </span>
              </button>
            </div>
          </form>
        </div>
      </div>

      <ContactModal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} onSuccess={handleContactSuccess} />
      <EsqueciSenha isOpen={isEsqueciSenhaOpen} onClose={() => setIsEsqueciSenhaOpen(false)} onSuccess={handleEsqueciSenhaSuccess} />
      <NovaSenha isOpen={isNovaSenhaOpen} onClose={() => setIsNovaSenhaOpen(false)} onSuccess={handleNovaSenhaSuccess} />
      <SuccessModal isOpen={isSuccessOpen} onClose={() => setIsSuccessOpen(false)} />
      <SuccessSenhaModal isOpen={isSuccessSenhaOpen} onClose={() => setIsSuccessSenhaOpen(false)} />

    </div>
  );
}

export default LoginPage;