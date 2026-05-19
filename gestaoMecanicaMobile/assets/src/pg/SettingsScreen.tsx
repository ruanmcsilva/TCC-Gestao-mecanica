import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, CircleCheck, Circle, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react-native';
import api from '../config/api';
export default function SettingsScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<number | null>(null);
  const [userData, setUserData] = useState({ first_name: '', email: '' });
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
  const [isDeactivating, setIsDeactivating] = useState(false);
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
  const handlePasswordChange = async () => {
    if (!Object.values(validations).every(v => v)) {
      Alert.alert('Aviso', 'A nova senha não atende aos requisitos de segurança.');
      return;
    }
    try {
      await api.post('/auth/password/change/', {
        old_password: passwordData.old_password,
        new_password1: passwordData.new_password,
        new_password2: passwordData.confirm_password
      });
      Alert.alert('Sucesso', 'Senha alterada com sucesso!');
      setPasswordData({ old_password: '', new_password: '', confirm_password: '' });
      setActiveTab(null);
    } catch (err: any) {
      console.error("Erro detalhado do Back:", err.response?.data);
      const errorData = err.response?.data;
      let msg = 'Erro ao alterar senha. Verifique os dados.';
      if (errorData) {
        if (errorData.old_password) msg = "Senha atual incorreta.";
        else if (errorData.new_password1) msg = errorData.new_password1[0];
        else if (errorData.non_field_errors) msg = errorData.non_field_errors[0];
      }
      Alert.alert('Erro', msg);
    }
  };
  const handleDeactivateAccount = () => {
    Alert.alert(
      "Você tem certeza?",
      "Esta ação é irreversível. Sua conta será bloqueada permanentemente.",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sim, desativar", 
          style: "destructive",
          onPress: async () => {
            setIsDeactivating(true);
            try {
              await api.post('/auth/user/deactivate/');
              Alert.alert('Sucesso', 'Sua conta foi desativada. Saindo...');
              setTimeout(() => {
                navigation.reset({
                  index: 0,
                  routes: [{ name: 'Login' }],
                });
              }, 2000);
            } catch (err) {
              Alert.alert('Erro', 'Erro ao desativar conta. Verifique se a rota existe no back.');
              setIsDeactivating(false);
            }
          }
        }
      ]
    );
  };
  const handleProfileSave = async () => {
    try {
      await api.patch('/auth/user/', { first_name: userData.first_name });
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível atualizar o perfil.');
    }
  };
  const Requisito = ({ label, met }: { label: string; met: boolean }) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
      {met ? <CircleCheck size={14} color="#10B981" /> : <Circle size={14} color="#9CA3AF" />}
      <Text style={{ marginLeft: 6, fontSize: 12, color: met ? '#10B981' : '#9CA3AF' }}>{label}</Text>
    </View>
  );
  const menuItems = [
    { 
      title: 'Editar informações de perfil', 
      renderContent: () => (
        <View style={styles.cardContent}>
          <Text style={styles.inputLabel}>Nome de Exibição</Text>
          <TextInput 
            style={styles.input}
            value={userData.first_name}
            onChangeText={(text) => setUserData({...userData, first_name: text})}
          />
          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput 
            style={[styles.input, { backgroundColor: '#F3F4F6', color: '#9CA3AF' }]}
            value={userData.email}
            editable={false}
          />
          <TouchableOpacity style={styles.darkButton} onPress={handleProfileSave}>
            <Text style={styles.darkButtonText}>Salvar Alterações</Text>
          </TouchableOpacity>
        </View>
      )
    },
    { 
      title: 'Permissões de usuário', 
      renderContent: () => (
        <Text style={styles.contentText}>Controle os níveis de acesso para cada cargo da oficina.</Text>
      )
    },
    { 
      title: 'Histórico de atividade', 
      renderContent: () => (
        <Text style={styles.contentText}>Registro de logs e ações realizadas pelos funcionários.</Text>
      )
    },
    { 
      title: 'LGPD e Termos de uso', 
      renderContent: () => (
        <View style={styles.cardContent}>
          <Text style={styles.contentText}>
            <Text style={{ fontWeight: 'bold' }}>LGPD:</Text> Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018):{'\n'}
            Esta plataforma processa dados pessoais (nome, CPF, telefone e placa de veículo) com a finalidade exclusiva de gestão de ordens de serviço e emissão de orçamentos. Garantimos que nenhum dado é compartilhado com terceiros sem consentimento prévio. O usuário tem o direito de solicitar a exclusão ou correção de seus dados a qualquer momento através das configurações de perfil.{'\n\n'}
            <Text style={{ fontWeight: 'bold' }}>Termos de Uso:</Text>{'\n'}
            1. Finalidade: O sistema destina-se exclusivamente ao gerenciamento interno da oficina.{'\n'}
            2. Responsabilidade: O usuário é responsável pela veracidade dos dados inseridos e pela guarda de sua senha de acesso.{'\n'}
            3. Privacidade: Todas as informações de faturamento e serviços são tratadas com sigilo e segurança digital.{'\n'}
            4. Alterações: Estes termos podem ser atualizados conforme novas funcionalidades forem implementadas no software.
          </Text>
          <TouchableOpacity onPress={() => Linking.openURL('https://www.gov.br/esporte/pt-br/acesso-a-informacao/lgpd')} style={{ marginTop: 10 }}>
            <Text style={{ color: '#2563EB', fontWeight: 'bold', textDecorationLine: 'underline' }}>Acesse a Lei no portal gov.br</Text>
          </TouchableOpacity>
        </View>
      )
    },
    { 
      title: 'Mudar senha', 
      renderContent: () => (
        <View style={styles.cardContent}>
          <Text style={styles.inputLabel}>Senha Atual</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput}
              secureTextEntry={!showOld}
              value={passwordData.old_password}
              onChangeText={(text) => setPasswordData({...passwordData, old_password: text})}
              placeholder="••••••••"
            />
            <TouchableOpacity onPress={() => setShowOld(!showOld)} style={styles.eyeIcon}>
              {showOld ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Nova Senha</Text>
          <View style={styles.passwordContainer}>
            <TextInput 
              style={styles.passwordInput}
              secureTextEntry={!showNew}
              value={passwordData.new_password}
              onChangeText={(text) => setPasswordData({...passwordData, new_password: text})}
              placeholder="••••••••"
            />
            <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eyeIcon}>
              {showNew ? <EyeOff size={18} color="#9CA3AF" /> : <Eye size={18} color="#9CA3AF" />}
            </TouchableOpacity>
          </View>
          <Text style={styles.inputLabel}>Confirmar Nova Senha</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry={true}
            value={passwordData.confirm_password}
            onChangeText={(text) => setPasswordData({...passwordData, confirm_password: text})}
            placeholder="••••••••"
          />
          <View style={{ marginTop: 10, marginBottom: 15 }}>
            <Requisito label="Mínimo de 8 caracteres" met={validations.minChars} />
            <Requisito label="Uma letra maiúscula" met={validations.upper} />
            <Requisito label="Uma letra minúscula" met={validations.lower} />
            <Requisito label="Um número" met={validations.number} />
            <Requisito label="Um caractere especial (@,#,%,&,$)" met={validations.special} />
          </View>
          <TouchableOpacity style={styles.darkButton} onPress={handlePasswordChange}>
            <Text style={styles.darkButtonText}>Atualizar Senha</Text>
          </TouchableOpacity>
        </View>
      )
    },
    { 
      title: 'Desativar Conta', 
      isDanger: true,
      renderContent: () => (
        <View style={styles.cardContent}>
          <Text style={{ color: '#EF4444', fontWeight: '500', marginBottom: 10, fontSize: 14 }}>
            Atenção: Ao desativar sua conta, você perderá acesso imediato ao sistema.
          </Text>
          <TouchableOpacity style={styles.dangerButton} onPress={handleDeactivateAccount} disabled={isDeactivating}>
            <Text style={styles.dangerButtonText}>{isDeactivating ? 'Processando...' : 'Desativar minha conta agora'}</Text>
          </TouchableOpacity>
        </View>
      )
    },
  ];
  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <View style={{ flex: 1, alignItems: 'center', marginRight: 32 }}>
          <Text style={styles.headerTitle}>Configurações</Text>
          <Text style={styles.headerSubtitle}>Preferências e segurança</Text>
        </View>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.sectionTitle}>Segurança e privacidade</Text>
        {menuItems.map((item, index) => {
          const isActive = activeTab === index;
          return (
            <View key={index} style={{ marginBottom: 10 }}>
              <TouchableOpacity
                onPress={() => toggleTab(index)}
                style={[
                  styles.accordionHeader,
                  item.isDanger ? { backgroundColor: '#FFECEB' } : { backgroundColor: '#F3F4F6' }
                ]}
              >
                <Text style={[styles.accordionTitle, item.isDanger ? { color: '#DC2626' } : { color: '#4B5563' }]}>
                  {item.title}
                </Text>
                {isActive ? (
                  <ChevronUp color={item.isDanger ? '#F87171' : '#9CA3AF'} size={20} />
                ) : (
                  <ChevronDown color={item.isDanger ? '#F87171' : '#9CA3AF'} size={20} />
                )}
              </TouchableOpacity>
              {isActive && (
                <View style={styles.accordionContent}>
                  {item.renderContent()}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 20
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937' },
  headerSubtitle: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', color: '#6B7280', marginBottom: 15, marginTop: 5, textTransform: 'uppercase', letterSpacing: 1 },
  accordionHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: 15, borderRadius: 12, borderWidth: 1, borderColor: 'rgba(229, 231, 235, 0.5)'
  },
  accordionTitle: { fontSize: 14, fontWeight: '600' },
  accordionContent: {
    padding: 15, backgroundColor: '#FFF', borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    borderWidth: 1, borderColor: '#F3F4F6', borderTopWidth: 0
  },
  cardContent: { width: '100%' },
  contentText: { fontSize: 14, color: '#374151', lineHeight: 22 },
  inputLabel: { fontSize: 11, fontWeight: 'bold', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 5, marginTop: 10, letterSpacing: 0.5 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8,
    padding: 12, fontSize: 14, color: '#374151'
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1, 
    borderColor: '#E5E7EB', borderRadius: 8, paddingHorizontal: 12
  },
  passwordInput: { flex: 1, paddingVertical: 12, fontSize: 14, color: '#374151' },
  eyeIcon: { padding: 5 },
  darkButton: {
    backgroundColor: '#1F2937', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 15
  },
  darkButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  dangerButton: {
    backgroundColor: '#DC2626', padding: 12, borderRadius: 8, alignItems: 'center'
  },
  dangerButtonText: { color: 'white', fontWeight: 'bold', fontSize: 14 }
});
