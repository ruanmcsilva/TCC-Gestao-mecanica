import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import api from '../api/api'; // Garanta que este caminho está correto no seu projeto

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
          <div className="bg-amber-500 text-black p-4 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <div className="bg-white p-1.5 rounded-lg">
                <MessageCircle size={20} />
              </div>
              <div>
                <h3 className="font-bold text-sm leading-none">Space Expert</h3>
                <span className="text-[10px] text-black uppercase font-black">IA de Mecânica</span>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div key={idx} className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                msg.role === 'user' 
                ? 'bg-amber-500 text-white self-end rounded-tr-none' 
                : 'bg-white border border-gray-200 text-gray-800 self-start rounded-tl-none'
              }`}>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-white border border-gray-200 p-3 rounded-2xl self-start rounded-tl-none max-w-[85%] flex items-center gap-3 shadow-sm">
                <Loader2 size={18} className="animate-spin text-amber-500" />
                <span className="text-xs text-gray-500 font-bold uppercase tracking-tighter">Analisando motor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-4 bg-white border-t border-gray-100 flex gap-2">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Dúvida técnica ou de peças..."
              className="flex-1 p-3 bg-gray-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-amber-500 text-white p-3 rounded-xl hover:bg-amber-400 disabled:bg-gray-300 transition-all shadow-lg shadow-blue-600/20"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Ícone de ativação (O botão redondo) */}
      <div 
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className={`w-16 h-16 bg-amber-500 rounded-full shadow-2xl flex items-center justify-center text-white transition-all ${
          isDragging ? 'cursor-grabbing scale-110 rotate-12' : 'cursor-grab hover:scale-110 active:scale-95'
        } border-4 border-white`}
      >
        <MessageCircle size={32} />
        {/* Badge indicador de IA */}
        <div className="absolute -top-1 -right-1 bg-orange-500 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
};

export default AIChatWidget;