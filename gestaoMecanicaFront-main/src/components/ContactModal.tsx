import React, { useState } from 'react';
import { X, ShieldAlert } from 'lucide-react';
import emailIcon from '../assets/email.svg';
import api from '../api/api';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; 
}

const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onSuccess }) => {
  
  const [userEmail, setUserEmail] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      
      await api.post('solicitar-acesso/', {
        email: userEmail
      });

      console.log("Solicitação enviada para o admin:", userEmail);
      onSuccess(); 
    } catch (error) {
      console.error("Erro ao solicitar acesso:", error);
      alert("Não foi possível enviar a solicitação. Verifique se o backend está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-md transition-opacity" 
        onClick={onClose}
      ></div>

      <div className="relative bg-white p-8 rounded-[20px] shadow-2xl max-w-md w-full transform transition-all flex flex-col items-center">
        
        <div className="flex justify-between items-center w-full mb-6">
          <h2 className="text-xl font-bold text-gray-900">Criar conta</h2>
          <X 
            className="w-6 h-6 text-gray-400 cursor-pointer hover:text-amber-500 transition-colors" 
            onClick={onClose} 
          />
        </div>

        <div className="mb-1 p-1">
          <ShieldAlert className="w-20 h-20 text-amber-500" />
        </div>

        <p className="text-black text-sm text-center mb-8">
          Solicitar acesso ao administrador do sistema para criar sua conta
        </p>

        <form onSubmit={handleSubmit} className="w-full space-y-6">
          <div className='relative'>
            {!userEmail && (
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <img src={emailIcon} alt="Email" className="w-5 h-5 text-black opacity-50" />
              </div>
            )}
            <input 
              placeholder='Digite seu e-mail'
              type="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              className={`${!userEmail ? 'pl-10' : 'px-4'} block w-full py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 sm:text-sm text-black placeholder-gray-400 transition-all`}
              style={{ boxShadow: '0 8px 10px -3px rgba(0, 0, 0, 0.15)' }}
              disabled={loading}
              required
            />
          </div>

          <div className="flex flex-row w-full gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 py-2 bg-white border-2 border-amber-500 text-amber-500 font-bold rounded-full hover:bg-amber-50 transition-all active:scale-95"
            >
              Cancelar
            </button>

            <button
              type="submit"
              disabled={loading}
              className="w-1/2 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-full transition-all shadow-md active:scale-95 shadow-amber-500/20 flex justify-center items-center"
            >
              {loading ? "Enviando..." : "Enviar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactModal;