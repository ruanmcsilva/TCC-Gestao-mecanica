import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, Image, Modal } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, Input, Icon, CheckBox } from '@rneui/themed'; 
import { Formik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import api from '../config/api'; 
import Feather from '@expo/vector-icons/Feather';
import { MaterialCommunityIcons } from '@expo/vector-icons'; 
import { useAuth } from '../contexts/AuthContext';

type RootStackParamList = { Home: undefined; Cadastro: undefined; Login: undefined; AppHome: undefined; CadastroToken: undefined };
type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

interface LoginProps {
  onLoginSuccess?: (token: string) => void;
}

const validationSchema = Yup.object().shape({
  login: Yup.string().required('Login obrigatório'),
  senha: Yup.string().min(8, 'A senha deve ter no mínimo 8 caracteres').required('Senha obrigatória'),
});

export default function LoginScreen(props: LoginProps) {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [showPassword, setShowPassword] = useState(false); 
  const [rememberMe, setRememberMe] = useState(false); 
  const [loading, setLoading] = useState(false); 
  const [initialLogin, setInitialLogin] = useState('');
  
  const [modalVisible, setModalVisible] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  
  const [step, setStep] = useState<'request' | 'newPassword' | 'success' | 'createAccount' | 'requestSent'>('request');
  
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [modalLoading, setModalLoading] = useState(false);
  const { fetchUser } = useAuth();

  const handleCreateAccount = async () => {
    if (!resetEmail) {
      Alert.alert("Aviso", "Por favor, insira seu e-mail.");
      return;
    }
    setModalLoading(true);
    try {
      await api.post('/solicitar-acesso/', { email: resetEmail.trim() });
      setStep('requestSent');
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar a solicitação.");
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      Alert.alert("Aviso", "Por favor, insira seu e-mail.");
      return;
    }
    setModalLoading(true);
    try {
      await api.post('/password_reset/', { email: resetEmail.trim() });
      setStep('newPassword');
    } catch (error) {
      Alert.alert("Erro", "E-mail não encontrado ou erro no servidor.");
    } finally {
      setModalLoading(false);
    }
  };

  const handlePasswordConfirm = async () => {
    if (!currentPass || !newPass || !confirmPass) {
      Alert.alert("Aviso", "Preencha todos os campos.");
      return;
    }
    if (newPass !== confirmPass) {
      Alert.alert("Aviso", "As senhas não coincidem!");
      return;
    }
    setModalLoading(true);
    try {
      await api.post('/password_reset/confirm/', { token: currentPass.trim(), password: newPass });
      setStep('success');
    } catch (error) {
      Alert.alert("Erro", "Código inválido ou expirado.");
    } finally {
      setModalLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      const savedLogin = await AsyncStorage.getItem('@app_user_login');
      if (savedLogin) {
        setInitialLogin(savedLogin);
        setRememberMe(true);
      }
    };
    loadData();
  }, []);

  const handleLogin = async (values: any) => {
    setLoading(true);
    try {
      const response = await api.post('/token/', {
        username: values.login,
        password: values.senha
      });
      const { access } = response.data;
      await AsyncStorage.setItem('@app_token', access);
      api.defaults.headers.Authorization = `Bearer ${access}`;
      if (rememberMe) { 
        await AsyncStorage.setItem('@app_user_login', values.login); 
      } else {
        await AsyncStorage.removeItem('@app_user_login');
      }
      if (props.onLoginSuccess) {
        props.onLoginSuccess(access); 
      }
     
      await fetchUser();
      navigation.replace('AppHome' as any); 
    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro de Login", "Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  const logo = require('../../logo.png');

  return (
    <View style={styles.background}>
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.appLogo} resizeMode="contain" />
      </View>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>


        <Formik
          enableReinitialize={true}
          initialValues={{ login: initialLogin, senha: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin} 
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.welcomeText}>Bem-vindo!</Text>
              
              <Input
                placeholder="Login"
                leftIcon={!values.login ? { type: 'font-awesome', name: 'user', color: '#9CA3AF' } : undefined}
                leftIconContainerStyle={{ marginLeft: 5 }}
                inputContainerStyle={styles.inputContainer}
                onChangeText={handleChange('login')}
                onBlur={handleBlur('login')}
                value={values.login}
                errorMessage={touched.login && errors.login ? errors.login : ''}
              />

              <Input
                placeholder="Senha"
                leftIcon={!values.senha ? { type: 'font-awesome', name: 'lock', color: '#9CA3AF' } : undefined}
                leftIconContainerStyle={{ marginLeft: 5 }}
                rightIcon={
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Icon type="font-awesome" name={showPassword ? 'eye' : 'eye-slash'} size={22} color="#6B7280" />
                  </TouchableOpacity>
                }
                inputContainerStyle={styles.inputContainer}
                onChangeText={handleChange('senha')}
                onBlur={handleBlur('senha')}
                value={values.senha}
                secureTextEntry={!showPassword}
                errorMessage={touched.senha && errors.senha ? errors.senha : ''}
              />
              
              <View style={styles.rememberMeRow}>
                <TouchableOpacity style={styles.leftGroup} onPress={() => { setStep('request'); setModalVisible(true); }}>
                  <Feather name="alert-circle" size={20} color="#FFD700" />
                  <Text style={styles.forgotPasswordText}>Esqueci minha senha</Text>
                </TouchableOpacity>

                <View style={styles.rightGroup}>
                  <Text style={styles.rememberMeText}>Remember me</Text>
                  <CheckBox
                    checked={rememberMe}
                    onPress={() => setRememberMe(!rememberMe)}
                    containerStyle={styles.checkboxContainer}
                    checkedColor="#EE6B22"
                  />
                </View>
              </View>

              <Button title="Entrar" buttonStyle={styles.btn} onPress={() => handleSubmit()} loading={loading} />
            </>
          )}
        </Formik>

        <View style={styles.footerRow}>
          <TouchableOpacity 
            style={styles.footerBtn} 
            onPress={() => { setStep('createAccount'); setModalVisible(true); }}
          >
            <MaterialCommunityIcons name="account-plus-outline" size={26} color="#EE6B22" />
            <Text style={styles.footerBtnText}>Falar com o{"\n"}Desenvolvedor</Text>
          </TouchableOpacity>

          <View style={styles.footerDivider} />

          <TouchableOpacity 
            style={styles.footerBtn} 
            onPress={() => navigation.navigate('CadastroToken' as any)}
          >
            <MaterialCommunityIcons name="shield-key-outline" size={26} color="#EE6B22" />
            <Text style={styles.footerBtnText}>Finalizar{"\n"}Cadastro</Text>
          </TouchableOpacity>
        </View>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { height: step === 'newPassword' ? '65%' : '55%' }]}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {['createAccount', 'requestSent'].includes(step) ? 'Criar conta' : 
                   step === 'request' ? 'Esqueci a senha' : 
                   step === 'newPassword' ? 'Nova senha' : 'Sucesso'}
                </Text>
                <TouchableOpacity onPress={() => { setModalVisible(false); setResetEmail(''); }}>
                  <Feather name="x" size={24} color="black" />
                </TouchableOpacity>
              </View>

              {step === 'createAccount' && (
                <>
                  <View style={styles.iconContainer}>
                    <Feather name="shield" size={130} color="#E33E33" />
                    <View style={styles.questionMark}>
                      <Text style={[styles.questionText, { color: '#E33E33', fontSize: 50, top: -5 }]}>!</Text>
                    </View>
                  </View>
                  <View style={styles.modalFooter}>
                    <Text style={[styles.instructionText, { textAlign: 'center' }]}>Solicitar acesso ao administrador do sistema para criar sua conta</Text>
                    <Input placeholder="Digite seu email" leftIcon={<Feather name="mail" size={22} color="#6B7280" />} leftIconContainerStyle={{ marginLeft: 15 }} inputContainerStyle={styles.roundedInput} containerStyle={styles.inputShadow} onChangeText={setResetEmail} value={resetEmail} />
                    <View style={styles.modalButtons}>
                      <Button title="Cancelar" type="outline" buttonStyle={styles.btnCancel} titleStyle={{ color: '#E33E33' }} onPress={() => setModalVisible(false)} />
                      <Button title="Enviar" buttonStyle={styles.btnSend} onPress={handleCreateAccount} loading={modalLoading} />
                    </View>
                  </View>
                </>
              )}

              {step === 'requestSent' && (
                <View style={styles.successContainer}>
                  <View style={{ marginBottom: 40 }}><Feather name="send" size={100} color="#EE6B22" /></View>
                  <Text style={[styles.instructionText, { textAlign: 'center', fontSize: 16 }]}>Sua solicitação foi enviada ao administrador.</Text>
                </View>
              )}

              {step === 'request' && (
                <>
                  <View style={styles.iconContainer}>
                    <Feather name="shield" size={130} color="#E33E33" />
                    <View style={styles.questionMark}><Text style={styles.questionText}>?</Text></View>
                  </View>
                  <View style={styles.modalFooter}>
                    <Text style={styles.instructionText}>Digite seu E-mail e clique em &quot;Enviar&quot; para{"\n"} receber um email para redefinir sua senha.</Text>
                    <Input placeholder="Digite seu email" leftIcon={<Feather name="mail" size={22} color="#6B7280" />} leftIconContainerStyle={{ marginLeft: 15 }} inputContainerStyle={styles.roundedInput} containerStyle={styles.inputShadow} onChangeText={setResetEmail} value={resetEmail} autoCapitalize="none" />
                    <View style={styles.modalButtons}>
                      <Button title="Cancelar" type="outline" buttonStyle={styles.btnCancel} titleStyle={{ color: '#E33E33' }} onPress={() => setModalVisible(false)} />
                      <Button title="Enviar" buttonStyle={styles.btnSend} onPress={handlePasswordReset} loading={modalLoading} />
                    </View>
                  </View>
                </>
              )}

              {step === 'newPassword' && (
                <View style={{ flex: 1 }}>
                  <Text style={styles.labelStep2}>Código recebido no email</Text>
                  <Input placeholder="Código" leftIconContainerStyle={{ marginLeft: 10 }} inputContainerStyle={styles.roundedInputStep2} onChangeText={setCurrentPass} value={currentPass} />
                  <Text style={styles.labelStep2}>Nova senha</Text>
                  <Input placeholder="Senha" secureTextEntry={!showNew} leftIconContainerStyle={{ marginLeft: 10 }} rightIcon={<TouchableOpacity onPress={() => setShowNew(!showNew)}><Icon type="font-awesome" name={showNew ? 'eye' : 'eye-slash'} size={20} color="#6B7280" /></TouchableOpacity>} inputContainerStyle={styles.roundedInputStep2} onChangeText={setNewPass} value={newPass} />
                  <Text style={styles.labelStep2}>Confirmar senha</Text>
                  <Input placeholder="Senha" secureTextEntry={!showConfirm} leftIconContainerStyle={{ marginLeft: 10 }} rightIcon={<TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}><Icon type="font-awesome" name={showConfirm ? 'eye' : 'eye-slash'} size={20} color="#6B7280" /></TouchableOpacity>} inputContainerStyle={styles.roundedInputStep2} onChangeText={setConfirmPass} value={confirmPass} />
                  
                  <View style={styles.checklistContainer}>
                    <View style={styles.checkItem}><Icon type="material-community" name="check-circle" size={16} color="#EE6B22" /><Text style={styles.checkText}>Mínimo de 8 caracteres</Text></View>
                    <View style={styles.checkItem}><Icon type="material-community" name="check-circle" size={16} color="#EE6B22" /><Text style={styles.checkText}>Uma letra maiúscula</Text></View>
                    <View style={styles.checkItem}><Icon type="material-community" name="check-circle" size={16} color="#EE6B22" /><Text style={styles.checkText}>Uma letra minúscula</Text></View>
                    <View style={styles.checkItem}><Icon type="material-community" name="check-circle" size={16} color="#EE6B22" /><Text style={styles.checkText}>Um número</Text></View>
                    <View style={styles.checkItem}><Icon type="material-community" name="check-circle" size={16} color="#EE6B22" /><Text style={styles.checkText}>Um caracter especial (@, #, %, &, $)</Text></View>
                  </View>

                  <View style={styles.modalButtons}>
                    <Button title="Cancelar" type="outline" buttonStyle={styles.btnCancel} titleStyle={{ color: '#E33E33' }} onPress={() => setStep('request')} />
                    <Button title="Salvar" buttonStyle={styles.btnSend} onPress={handlePasswordConfirm} loading={modalLoading} />
                  </View>
                </View>
              )}

              {step === 'success' && (
                <View style={styles.successContainer}>
                  <Icon type="material-community" name="check-circle" size={120} color="#EE6B22" />
                  <Text style={styles.successTitle}>Senha Atualizada!</Text>
                </View>
              )}
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#1E1E1E' },
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  logoContainer: { alignItems: 'center', marginTop: 40, marginBottom: 15 },
  appLogo: { width: 220, height: 220, alignSelf: 'center', opacity: 0.8 },
  welcomeText: { color: '#EE6B22', fontSize: 24, marginBottom: 10, fontWeight: 'bold', marginLeft: 10 },
  inputContainer: { backgroundColor: '#FFFFFF', borderRadius: 10, paddingHorizontal: 10, borderBottomWidth: 0 },
  rememberMeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: 15 },
  leftGroup: { flexDirection: 'row', alignItems: 'center' },
  forgotPasswordText: { color: '#9CA3AF', fontSize: 14, marginLeft: 5 },
  rightGroup: { flexDirection: 'row', alignItems: 'center' },
  checkboxContainer: { backgroundColor: 'transparent', borderWidth: 0, padding: 0, marginLeft: 8 },
  rememberMeText: { color: '#9CA3AF', fontSize: 16, fontWeight: '500' },
  btn: { borderRadius: 50, marginTop: 16, backgroundColor: '#EE6B22', paddingVertical: 12 },
  
  footerRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: 35,
    backgroundColor: '#262626',
    borderRadius: 15,
    paddingVertical: 18,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#333'
  },
  footerBtn: { flex: 1, alignItems: 'center' },
  footerBtnText: { 
    color: 'white', 
    textAlign: 'center', 
    fontSize: 11, 
    fontWeight: '800', 
    marginTop: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  footerDivider: { width: 1, height: '70%', backgroundColor: '#444' },

  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.7)' },
  modalContent: { backgroundColor: '#F3F4F6', borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  modalTitle: { fontSize: 22, fontWeight: '600' },
  iconContainer: { alignItems: 'center', marginTop: 10, position: 'relative' },
  questionMark: { position: 'absolute', top: 35 },
  questionText: { fontSize: 45, color: '#E33E33' },
  modalFooter: { marginTop: 'auto' },
  instructionText: { textAlign: 'left', color: 'black', fontSize: 14, marginBottom: 10, paddingHorizontal: 15 },
  roundedInput: { backgroundColor: '#F9FAFB', borderRadius: 12, height: 50, borderWidth: 1, borderColor: '#D1D5DB' },
  inputShadow: { elevation: 2, marginBottom: 10 },
  labelStep2: { color: '#EE6B22', fontWeight: 'bold', marginBottom: 2, marginLeft: 5, fontSize: 13 },
  roundedInputStep2: { backgroundColor: 'white', borderRadius: 10, borderBottomWidth: 1, borderColor: '#D1D5DB', height: 40, paddingHorizontal: 10 },
  checklistContainer: { marginTop: 8, marginBottom: 8 }, 
  checkItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  checkText: { fontSize: 12, color: '#374151', marginLeft: 8 },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 'auto', marginBottom: 5 },
  btnCancel: { borderColor: '#E33E33', borderWidth: 1.5, borderRadius: 25, width: 140, paddingVertical: 8 },
  btnSend: { backgroundColor: '#EE6B22', borderRadius: 25, width: 160, paddingVertical: 8 },
  successContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#111827', marginTop: 15 }
});
