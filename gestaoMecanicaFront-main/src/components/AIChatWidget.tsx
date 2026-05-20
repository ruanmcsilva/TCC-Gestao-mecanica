import React, { useState, useRef, useEffect } from 'react';
import { Bot, MessageCircle, X, Send, Loader2 } from 'lucide-react';
import api from '../api/api';

const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ x: window.innerWidth - 80, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
    { role: 'ai', text: 'Olá! Sou o Space Expert, seu assistente de mecânica. Como posso ajudar com a manutenção hoje?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const widgetRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null); // Ref para o scroll
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartMousePos = useRef({ x: 0, y: 0 });

  // Auto-scroll para a última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (isOpen) return;
    setIsDragging(true);
    dragStartPos.current = { ...position };
    dragStartMousePos.current = { x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const dx = e.clientX - dragStartMousePos.current.x;
    const dy = e.clientY - dragStartMousePos.current.y;
    
    const newX = Math.min(Math.max(0, dragStartPos.current.x + dx), window.innerWidth - 60);
    const newY = Math.min(Math.max(0, dragStartPos.current.y + dy), window.innerHeight - 60);
    
    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setIsDragging(false);
    e.currentTarget.releasePointerCapture(e.pointerId);
    
    const dx = Math.abs(e.clientX - dragStartMousePos.current.x);
    const dy = Math.abs(e.clientY - dragStartMousePos.current.y);
    if (dx < 5 && dy < 5) {
      setIsOpen(true);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => ({
        x: Math.min(prev.x, window.innerWidth - 60),
        y: Math.min(prev.y, window.innerHeight - 60)
      }));
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      // Endpoint que configuramos no urls.py do Django
      const res = await api.post('/ai/consultar/', { pergunta: userMsg });
      setMessages(prev => [...prev, { role: 'ai', text: res.data.resposta || 'Não consegui processar essa informação agora.' }]);
    } catch (error: any) {
      console.error("Erro na consulta da IA:", error);
      setMessages(prev => [...prev, { role: 'ai', text: 'Ocorreu um erro ao falar com o Expert. Verifique sua conexão.' }]);
    } finally {
      setLoading(false);
    }
  };

  const isTopHalf = position.y < window.innerHeight / 2;
  const isLeftHalf = position.x < window.innerWidth / 2;

  return (
    <div 
      ref={widgetRef}
      style={{ 
        position: 'fixed', 
        left: position.x, 
        top: position.y, 
        zIndex: 9999,
        touchAction: 'none'
      }}
      className="flex flex-col"
    >
      {isOpen && (
        <div className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 h-[450px] flex flex-col mb-4 overflow-hidden border border-gray-200"
             style={{ 
               position: 'absolute', 
               top: isTopHalf ? '70px' : 'auto',
               bottom: !isTopHalf ? '70px' : 'auto',
               left: isLeftHalf ? '0px' : 'auto',
               right: !isLeftHalf ? '0px' : 'auto',
             }}
        >
          {/* Header estilizado para combinar com o tema Space Motos */}
          <div className="bg-[#1a1a1a] text-white p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 p-2 rounded-full">
                <Bot size={24} color="white" />
              </div>
              <div>
                <h3 className="font-bold text-base leading-none">Space Expert</h3>
                <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest">IA de Mecânica</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-1.5 rounded-lg transition-colors">
              <X size={24} color="white" />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-[#f0f2f5]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3.5 rounded-2xl text-[15px] shadow-sm leading-relaxed ${
                msg.role === 'user' 
                ? 'bg-[#F97316] text-white self-end rounded-br-sm' 
                : 'bg-[#1a1a1a] text-white self-start rounded-bl-sm'
              }`}>
                {msg.role === 'ai' && (
                  <span className="text-[#F97316] text-[10px] font-bold mb-1 tracking-widest block uppercase">SPACE EXPERT</span>
                )}
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-[#1a1a1a] text-white p-3.5 rounded-2xl self-start rounded-bl-sm max-w-[85%] flex items-center gap-3 shadow-sm">
                <Loader2 size={18} className="animate-spin text-[#F97316]" />
                <span className="text-xs font-bold uppercase tracking-tighter">Analisando motor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Descreva o problema da moto..."
              className="flex-1 px-4 py-3 bg-[#f8f9fa] border border-gray-200 rounded-full text-[15px] text-gray-800 focus:ring-2 focus:ring-[#F97316] focus:border-transparent outline-none transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-[#F97316] text-white w-12 h-12 flex items-center justify-center rounded-full hover:bg-orange-600 disabled:bg-gray-300 transition-all shadow-md flex-shrink-0"
            >
              <Send size={20} className="ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Ícone de ativação (O botão redondo) */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-16 h-16 bg-[#F97316] rounded-full shadow-2xl flex items-center justify-center text-white transition-all ${
          isDragging ? 'cursor-grabbing scale-110 rotate-12' : 'cursor-grab hover:scale-110 active:scale-95'
        } border-4 border-white`}
      >
        <Bot size={32} />
        {/* Badge indicador de IA */}
        <div className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;