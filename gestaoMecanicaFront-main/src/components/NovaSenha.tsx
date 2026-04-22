import React, { useState, useEffect } from 'react';
import { X, CircleCheck, Circle } from 'lucide-react';
import api from '../api/api'; // Certifique-se que o caminho está correto

interface NovaSenhaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NovaSenha: React.FC<NovaSenhaProps> = ({ isOpen, onClose, onSuccess }) => {
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [loading, setLoading] = useState(false);

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

  if (!isOpen) return null;

  // FUNÇÃO CONECTADA AO BACKEND
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verifica validações locais antes de mandar pro back
    if (!Object.values(validations).every(v => v)) {
      alert("A senha não atende aos requisitos de segurança.");
      return;
    }

    if (senha !== confirmaSenha) {
      alert("As senhas não coincidem!");
      return;
    }

    setLoading(true);

    try {
      // Chamada para o Django confirmar o reset
      await api.post('password_reset/confirm/', {
        token: codigo, // O campo código do seu estado
        password: senha
      });

      console.log("Senha redefinida com sucesso!");
      onSuccess(); // Abre o modal de sucesso final (o do check)
    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      // Se o token estiver expirado ou errado, o Django avisa
      alert("Erro ao redefinir: Código inválido ou expirado.");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose}></div>

      <div className="relative bg-white p-8 rounded-[20px] shadow-2xl max-w-md w-full flex flex-col items-center">
        <div className="flex justify-between items-center w-full mb-6">
          <h2 className="text-xl font-bold text-gray-900">Redefinir Senha</h2>
          <X className="w-6 h-6 text-gray-400 cursor-pointer hover:text-amber-500" onClick={onClose} />
        </div>

        <form onSubmit={handleSave} className="w-full space-y-4">
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Código</label>
            <input 
              type="text" placeholder="Código recebido por e-mail" value={codigo} onChange={(e) => setCodigo(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-black outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              required
            />
          </div>

          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Nova Senha</label>
            <input 
              type="password" placeholder="Nova senha" value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-black outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              required
            />
          </div>

          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Confirma senha</label>
            <input 
              type="password" placeholder="Repita a senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-black outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-1 py-2">
            <Requisito label="Mínimo de 8 caracteres" met={validations.minChars} />
            <Requisito label="Uma letra maiúscula" met={validations.upper} />
            <Requisito label="Uma letra minúscula" met={validations.lower} />
            <Requisito label="Um número" met={validations.number} />
            <Requisito label="Um caractere especial (@,#,%,&,$)" met={validations.special} />
          </div>

          <div className="flex flex-row w-full gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-1/2 py-2.5 bg-white border-2 border-amber-500 text-amber-500 font-bold rounded-full hover:bg-amber-50 transition-all">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-md shadow-amber-500/20 flex justify-center items-center"
            >
              {loading ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaSenha;