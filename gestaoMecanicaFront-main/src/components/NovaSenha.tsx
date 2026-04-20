import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, CircleCheck, Circle } from 'lucide-react';

interface NovaSenhaProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const NovaSenha: React.FC<NovaSenhaProps> = ({ isOpen, onClose, onSuccess }) => {
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');

  // Estados de Validação
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (Object.values(validations).every(v => v) && senha === confirmaSenha) {
      onSuccess();
    } else {
      alert("Verifique os requisitos da senha!");
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
          {/* Campo Código */}
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Código</label>
            <input 
              type="text" placeholder="Código" value={codigo} onChange={(e) => setCodigo(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-500 outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          {/* Campo Nova Senha */}
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Nova Senha</label>
            <input 
              type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-500 outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          {/* Campo Confirmar Senha */}
          <div>
            <label className="block text-amber-500 text-sm font-bold mb-1">Confirma senha</label>
            <input 
              type="password" placeholder="Senha" value={confirmaSenha} onChange={(e) => setConfirmaSenha(e.target.value)}
              className="w-full py-2.5 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 text-gray-500 outline-none transition-all"
              style={{ boxShadow: '0 4px 6px -2px rgba(0, 0, 0, 0.1)' }}
            />
          </div>

          {/* Requisitos da Senha */}
          <div className="grid grid-cols-1 gap-1 py-2">
            <Requisito label="Mínimo de 8 caracteres" met={validations.minChars} />
            <Requisito label="Uma letra maiúscula" met={validations.upper} />
            <Requisito label="Uma letra minúscula" met={validations.lower} />
            <Requisito label="Um número" met={validations.number} />
            <Requisito label="Um caractere especial (@,#,%,&,$)" met={validations.special} />
          </div>


          {/* Botões Lado a Lado */}
          <div className="flex flex-row w-full gap-4 pt-4">
            <button type="button" onClick={onClose} className="w-1/2 py-2.5 bg-white border-2 border-amber-500 text-amber-500 font-bold rounded-full hover:bg-amber-50 transition-all">
              Cancelar
            </button>
            <button type="submit" className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-md shadow-amber-500/20">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaSenha;