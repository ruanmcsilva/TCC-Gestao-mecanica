// src/components/SuccessModal.tsx
import React from 'react';
import { X, Send } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Camada de Ofuscamento */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Caixa do Modal: Aumentada em altura (min-h-[450px]) e largura (max-w-lg) */}
      <div className="relative bg-white p-10 rounded-[20px] shadow-2xl max-w-lg w-full min-h-[370px] transform transition-all flex flex-col items-center justify-between">
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-center w-full">
          <h2 className="text-xl font-bold text-black">Criar conta</h2>
          <X 
            className="w-6 h-6 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors" 
            onClick={onClose} 
          />
        </div>

        <div className="flex flex-col items-center justify-center flex-grow py-6">
          <div className="mb-6">
            
            <Send className="w-24 h-24 text-amber-500" />
          </div>

          <div className="text-center space-y-4 p-4">
            <p className="text-black">
              Solicitação enviadafoi enviada ao administrador.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal;