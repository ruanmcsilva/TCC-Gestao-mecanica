import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CircleCheck, Circle, Eye, EyeOff } from 'lucide-react';
import api from '../api/api';
import logo from '../assets/logo.png';
import { useNotification } from '../contexts/NotificationContext';

const CadastroTokenScreen: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tokenUrl = searchParams.get('token') || '';
  const emailUrl = searchParams.get('email') || '';

  const navigate = useNavigate();
  const { showNotification } = useNotification();

  const [token, setToken] = useState(tokenUrl);
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const [showSenha, setShowSenha] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);

  const [validations, setValidations] = useState({
    minChars: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setValidations({
      minChars: senha.length >= 8,
      upper: /[A-Z]/.test(senha),
      lower: /[a-z]/.test(senha),
      number: /[0-9]/.test(senha),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    });
  }, [senha]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!Object.values(validations).every((v) => v)) {
      showNotification('A senha não atende aos requisitos de segurança.', 'error');
      return;
    }

    if (senha !== confirmaSenha) {
      showNotification('As senhas não coincidem!', 'error');
      return;
    }

    setLoading(true);

    try {
      await api.post('/registrar-com-token/', {
        token,
        nome,
        senha,
        confirmacao_senha: confirmaSenha
      });

      showNotification('Conta criada com sucesso! Use seu e-mail para fazer login.', 'success');
      navigate('/login');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao registrar conta. Token inválido ou expirado.';
      showNotification(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const Requisito = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center gap-2 text-xs ${met ? 'text-amber-500' : 'text-gray-500'}`}>
      {met ? <CircleCheck size={16} /> : <Circle size={15} />}
      <span>{label}</span>
    </div>
  );

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full flex flex-col items-center">
        <img src={logo} alt="Logo" className="h-16 mb-6" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Finalizar Cadastro</h2>
        <p className="text-sm text-gray-500 mb-6 text-center">
          {emailUrl ? `Criando conta para: ${emailUrl}` : 'Insira o token recebido por e-mail e crie sua senha.'}
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          {!tokenUrl && (
            <div>
              <label className="block text-amber-500 text-sm font-bold mb-1">Token de Acesso</label>
              <input
                type="text"
                placeholder="Ex: 123e4567-e89b-12d3..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Nome Completo</label>
            <input
              type="text"
              placeholder="Digite seu nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Nova Senha</label>
            <div className="relative">
              <input
                type={showSenha ? 'text' : 'password'}
                placeholder="Crie uma senha forte"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowSenha(!showSenha)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
              >
                {showSenha ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
            <Requisito label="Mín. 8 caracteres" met={validations.minChars} />
            <Requisito label="Letra maiúscula" met={validations.upper} />
            <Requisito label="Letra minúscula" met={validations.lower} />
            <Requisito label="Número" met={validations.number} />
            <Requisito label="Caractere especial" met={validations.special} />
          </div>

          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Confirmar Senha</label>
            <div className="relative">
              <input
                type={showConfirma ? 'text' : 'password'}
                placeholder="Repita a senha"
                value={confirmaSenha}
                onChange={(e) => setConfirmaSenha(e.target.value)}
                className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirma(!showConfirma)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-500"
              >
                {showConfirma ? <EyeOff size={19} /> : <Eye size={19} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-all shadow-md mt-4 disabled:opacity-50"
          >
            {loading ? 'Criando Conta...' : 'Finalizar Cadastro'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CadastroTokenScreen;