import React, { useState, useEffect } from 'react';
import api from '../api/api';
import { useNotification } from '../contexts/NotificationContext';
import { CircleCheck, Circle, Eye, EyeOff, AlertTriangle } from 'lucide-react';

const ConfiguracoesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const { showNotification } = useNotification();

  // --- ESTADOS DO PERFIL ---
  const [userData, setUserData] = useState({ first_name: '', email: '' });

  // --- ESTADOS DA SENHA ---
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordData, setPasswordData] = useState({
    old_password: '',
    new_password: '',
    confirm_password: ''
  });

  const [validations, setValidations] = useState({
    minChars: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  // --- ESTADOS DE DESATIVAÇÃO ---
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  // Busca dados do usuário ao carregar a página
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/auth/user/');
        setUserData(response.data);
      } catch (err) {
        console.error("Erro ao buscar dados do usuário", err);
      }
    };
    fetchUserData();
  }, []);

  // Monitora a nova senha para validar os requisitos
  useEffect(() => {
    const s = passwordData.new_password;
    setValidations({
      minChars: s.length >= 8,
      upper: /[A-Z]/.test(s),
      lower: /[a-z]/.test(s),
      number: /[0-9]/.test(s),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(s),
    });
  }, [passwordData.new_password]);

  const toggleTab = (index: number) => {
    setActiveTab(activeTab === index ? null : index);
  };

const handlePasswordChange = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!Object.values(validations).every(v => v)) {
    showNotification('A nova senha não atende aos requisitos de segurança.', 'error');
    return;
  }

  try {
    // Testaremos o padrão ouro do dj-rest-auth:
    await api.post('/auth/password/change/', {
      old_password: passwordData.old_password,
      new_password1: passwordData.new_password,
      new_password2: passwordData.confirm_password
    });

    showNotification('Senha alterada com sucesso!', 'success');
    setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
    setActiveTab(null); 
  } catch (err: any) {
    // Se der erro, vamos olhar no Console (F12) para ver o que o Django respondeu
    console.error("Erro detalhado do Back:", err.response?.data);
    
    const errorData = err.response?.data;
    let msg = 'Erro ao alterar senha. Verifique os dados.';
    
    if (errorData) {
      // Se o erro for na senha antiga:
      if (errorData.old_password) msg = "Senha atual incorreta.";
      // Se o erro for na nova (muito comum, curta, etc):
      else if (errorData.new_password1) msg = errorData.new_password1[0];
      else if (errorData.non_field_errors) msg = errorData.non_field_errors[0];
    }

    showNotification(msg, 'error');
  }
};

  const handleProfileUpdate = async () => {
    try {
      await api.patch('/auth/user/', { first_name: userData.first_name });
      showNotification('Perfil atualizado com sucesso!', 'success');
      setActiveTab(null);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      showNotification('Erro ao atualizar perfil.', 'error');
    }
  };

  const handleDeactivateAccount = async () => {
    setIsDeactivating(true);
    try {
      await api.post('/auth/user/deactivate/'); 
      showNotification('Sua conta foi desativada. Saindo...', 'success');
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 2000);
    } catch (err) {
      showNotification('Erro ao desativar conta. Verifique se a rota existe no back.', 'error');
      setIsDeactivating(false);
      setIsDeactivateModalOpen(false);
    }
  };

  const Requisito = ({ label, met }: { label: string; met: boolean }) => (
    <div className={`flex items-center gap-2 text-[11px] ${met ? 'text-green-500' : 'text-gray-400'}`}>
      {met ? <CircleCheck size={14} /> : <Circle size={14} />}
      <span>{label}</span>
    </div>
  );

  const menuItems = [
    { 
      title: 'Editar informações de perfil', 
      content: (
        <div className="space-y-4 max-w-md bg-white p-4 rounded-xl border border-gray-100">
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nome de Exibição</label>
            <input 
              type="text" 
              value={userData.first_name}
              onChange={(e) => setUserData({...userData, first_name: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-400 text-gray-700" 
            />
          </div>
          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">E-mail</label>
            <input 
              type="email" 
              value={userData.email}
              readOnly
              className="w-full p-2.5 bg-gray-100 border border-gray-200 rounded-lg text-gray-400 cursor-not-allowed" 
            />
          </div>
          <button onClick={handleProfileUpdate} className="bg-gray-800 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-black transition-all">
            Salvar Alterações
          </button>
        </div>
      )
    },
    { 
  title: 'LGPD e Termos de uso', 
  content: (
    <div className="space-y-4 text-gray-700 leading-relaxed text-[14px]">
      <p>
        <strong className="text-gray-900">LGPD:</strong> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):<br />
        Esta plataforma processa dados pessoais (nome, CPF, telefone e placa de veículo) com a finalidade exclusiva de gestão de ordens de serviço e emissão de orçamentos. Garantimos que nenhum dado é compartilhado com terceiros sem consentimento prévio. O usuário tem o direito de solicitar a exclusão ou correção de seus dados a qualquer momento através das configurações de perfil.
      </p>
      
      <p>
        <strong className="text-gray-900">Termos de Uso:</strong><br />
        1. Finalidade: O sistema destina-se exclusivamente ao gerenciamento interno da oficina.<br />
        2. Responsabilidade: O usuário é responsável pela veracidade dos dados inseridos e pela guarda de sua senha de acesso.<br />
        3. Privacidade: Todas as informações de faturamento e serviços são tratadas com sigilo e segurança digital.<br />
        4. Alterações: Estes termos podem ser atualizados conforme novas funcionalidades forem implementadas no software.
      </p>

      <a 
        href="https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-blue-600 font-bold underline block mt-2 hover:text-blue-800"
      >
        Acesse a Lei no portal gov.br
      </a>
    </div>
  )
},
    { 
      title: 'Mudar senha', 
      content: (
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
          <div className="relative">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Senha Atual</label>
            <div className="relative">
              <input 
                type={showOld ? "text" : "password"} 
                value={passwordData.old_password}
                onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 pr-10" 
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                {showOld ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="relative">
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Nova Senha</label>
            <div className="relative">
              <input 
                type={showNew ? "text" : "password"} 
                value={passwordData.new_password}
                onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-400 text-gray-700 pr-10" 
                placeholder="••••••••"
                required
              />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-500">
                {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Confirmar Nova Senha</label>
            <input 
              type="password" 
              value={passwordData.confirm_password}
              onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-1 focus:ring-orange-400 text-gray-700" 
              placeholder="••••••••"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-1.5 py-2 border-t border-gray-50 pt-3">
            <Requisito label="Mínimo de 8 caracteres" met={validations.minChars} />
            <Requisito label="Uma letra maiúscula" met={validations.upper} />
            <Requisito label="Uma letra minúscula" met={validations.lower} />
            <Requisito label="Um número" met={validations.number} />
            <Requisito label="Um caractere especial (@,#,%,&,$)" met={validations.special} />
          </div>

          <button type="submit" className="w-full bg-gray-800 text-white px-5 py-2.5 rounded-lg font-bold text-sm hover:bg-black transition-all shadow-lg shadow-gray-200">
            Atualizar Senha
          </button>
        </form>
      )
    },
    { 
      title: 'Desativar Conta', 
      content: (
        <div className="space-y-3">
          <p className="text-red-500 font-medium text-sm">
            Atenção: Ao desativar sua conta, você perderá acesso imediato ao sistema.
          </p>
          <button 
            onClick={() => setIsDeactivateModalOpen(true)}
            className="bg-red-600 text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-red-700 transition-colors"
          >
            Desativar minha conta agora
          </button>
        </div>
      ), 
      isDanger: true 
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen font-sans flex flex-col items-start relative">
      <div className="w-4/5 mb-8">
        <h1 className="text-2xl font-black text-gray-800 mb-1">Configurações</h1>
        <p className="text-gray-400 text-xs font-medium">Preferências e segurança do sistema</p>
      </div>

      <div className="w-4/5 mb-4">
        <h2 className="text-[11px] font-bold text-gray-500 uppercase tracking-[0.2em]">Segurança e privacidade</h2>
      </div>

      <div className="w-4/5 space-y-3">
        {menuItems.map((item, index) => (
          <div key={index} className="overflow-hidden">
            <button
              onClick={() => toggleTab(index)}
              style={item.isDanger ? { backgroundColor: '#FFECEB' } : { backgroundColor: '#F3F4F6' }}
              className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200/50 transition-all outline-none hover:brightness-95"
            >
              <span className={`text-sm font-semibold ${item.isDanger ? 'text-red-600' : 'text-gray-600'}`}>{item.title}</span>
              <svg className={`h-4 w-4 ${item.isDanger ? 'text-red-400' : 'text-gray-400'} transition-transform duration-300 ${activeTab === index ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${activeTab === index ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
              <div className="px-5 py-4 text-gray-700 text-[14px] font-medium leading-relaxed">
                {item.content}
              </div>
            </div>
          </div>
        ))}
      </div>

      {isDeactivateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-full text-center shadow-2xl border border-red-50">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Você tem certeza?</h3>
            <p className="text-gray-500 text-sm mb-6">Esta ação é irreversível. Sua conta será bloqueada permanentemente.</p>
            <div className="flex gap-3">
              <button onClick={() => setIsDeactivateModalOpen(false)} className="flex-1 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-all">Cancelar</button>
              <button onClick={handleDeactivateAccount} disabled={isDeactivating} className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-all disabled:opacity-50">
                {isDeactivating ? 'Processando...' : 'Sim, desativar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfiguracoesPage;