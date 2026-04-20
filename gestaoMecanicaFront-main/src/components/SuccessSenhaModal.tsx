// src/components/SuccessSenhaModal.tsx
import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface SuccessSenhaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessSenhaModal: React.FC<SuccessSenhaModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Camada de Ofuscamento */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Caixa do Modal: Alta e Larga como os anteriores */}
      <div className="relative bg-white p-10 rounded-[20px] shadow-2xl max-w-lg w-full min-h-[370px] transform transition-all flex flex-col items-center justify-between">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-black">Redefinir Senha</h2>
          <X 
            className="w-6 h-6 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors" 
            onClick={onClose} 
          />
        </div>

        {/* Conteúdo Centralizado */}
        <div className="flex flex-col items-center justify-center flex-grow py-6">
          <div className="mb-6">
            {/* Ícone de Check para indicar sucesso total */}
            <CheckCircle2 className="w-24 h-24 text-amber-500" />
          </div>

          <div className="text-center space-y-4 p-4">
            <p className="text-black text-xl font-bold">
              Senha alterada com sucesso!
            </p>
            <p className="text-gray-500 text-sm">
              Sua nova senha foi salva. Agora você já pode <br />
              acessar o sistema normalmente.
            </p>
          </div>
        </div>

        {/* Botão de Fechar */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-md active:scale-95 shadow-amber-500/20"
        >
          Ir para o Login
        </button>
      </div>
    </div>
  );
};

export default SuccessSenhaModal;