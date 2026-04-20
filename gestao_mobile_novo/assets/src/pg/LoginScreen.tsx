import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, Switch, Alert, Image } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Button, Input, Icon } from '@rneui/themed'; 
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../components/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage'; 

type RootStackParamList = { Home: undefined; Cadastro: undefined; Login: undefined };
type LoginScreenNavigationProp = NavigationProp<RootStackParamList, 'Login'>;

const validationSchema = Yup.object().shape({
  email: Yup.string().email('E-mail inválido').required('E-mail obrigatório'),
  senha: Yup.string().min(8, 'A senha deve ter no mínimo 8 caracteres').required('Senha obrigatória'),
});

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithEmailAndPassword } = useAuth();
  const [showPassword, setShowPassword] = useState(false); 
  const [rememberMe, setRememberMe] = useState(false); 
  const [loading, setLoading] = useState(false); 

  const PasswordAccessory = () => (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} accessibilityLabel={showPassword ? "Esconder senha" : "Mostrar senha"}>
      <Icon 
        type="font-awesome" 
        name={showPassword ? 'eye-slash' : 'eye'} 
        size={22} 
        color="#6B7280" 
      />
    </TouchableOpacity>
  );

  const handleLogin = async (values: typeof validationSchema.default) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(values); 
      if (rememberMe) { 
        await AsyncStorage.setItem('@app_remember_me', 'true');
      } else { 
        await AsyncStorage.removeItem('@app_remember_me');
      }
      navigation.replace('Home'); 
    } catch (error: any) {
      let errorMessage = "Ocorreu um erro desconhecido ao fazer login.";
      
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        errorMessage = "Credenciais inválidas. Verifique seu e-mail e senha.";
      } else if (error.code) {
        errorMessage = `Erro: ${error.code.replace('auth/', '').split('-').join(' ')}`;
      }

      Alert.alert("Erro de Login", errorMessage);
      console.error("Erro de Login:", error);
    } finally {
      setLoading(false);
    }
  };

  const logo = require('../img/logo.png');

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.background}
    >
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image 
            source={logo} 
            style={styles.appLogo} 
            resizeMode="cover" // Alterado para 'cover' para preencher o círculo
          />
        </View>

        <Formik
          initialValues={{ email: '', senha: '' }}
          validationSchema={validationSchema}
          onSubmit={handleLogin} 
        >
          {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
            <>
              <Text style={styles.welcomeText}>Bem-vindo!</Text>
              <Input
                labelStyle={styles.label}
                placeholder="Email"
                leftIcon={{ type: 'font-awesome', name: 'envelope', color: '#9CA3AF' }}
                inputStyle={styles.inputStyle}
                inputContainerStyle={styles.inputContainer}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                errorMessage={touched.email && errors.email ? errors.email : ''}
                accessibilityLabel="Campo de entrada para e-mail"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                labelStyle={styles.label}
                placeholder="Senha"
                leftIcon={{ type: 'font-awesome', name: 'lock', color: '#9CA3AF' }}
                rightIcon={<PasswordAccessory />}
                inputStyle={styles.inputStyle}
                inputContainerStyle={styles.inputContainer}
                onChangeText={handleChange('senha')}
                onBlur={handleBlur('senha')}
                value={values.senha}
                secureTextEntry={!showPassword}
                errorMessage={touched.senha && errors.senha ? errors.senha : ''}
                accessibilityLabel="Campo de entrada para senha"
              />
              
              <View style={styles.rememberMeContainer}>
                <Switch
                  trackColor={{ false: "#E5E7EB", true: "#A3E635" }}
                  thumbColor={rememberMe ? "#4D7C0F" : "#F4F4F5"}
                  onValueChange={setRememberMe}
                  value={rememberMe}
                />
                <Text style={styles.rememberMeText}>Lembrar de mim</Text>
              </View>

              <Button
                title="Entrar"
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading}
                accessibilityHint="Toque duas vezes para fazer login"
              />
            </>
          )}
        </Formik>
        <TouchableOpacity 
          onPress={() => navigation.navigate('Cadastro')}
          style={styles.btnCadastroContainer}
        >
          <Text style={styles.btnTitle}>
            <Text style={styles.btnCadastroTitle}>Não tem conta? </Text>
            <Text style={styles.btnCadastroTitledev}>Entre em contato com o {"\n"}desenvolvedor</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'black', 
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appLogo: {
    width: 150, 
    height: 150, 
    borderRadius: 75, 
    overflow: 'hidden',
    marginBottom: 16,
  
  },
  logo: {
    color: '#1A2E05', 
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#EE6b22',
    fontSize: 24,
  },
  subtitle: {
    color: '#3F3F46', 
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    color: '#3F3F46', 
    fontWeight: '500',
    fontSize: 14,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1', 
    paddingHorizontal: 10,
    borderBottomWidth: 1, 
    marginBottom: 5,
  },
  inputStyle: {
    color: '#1E293B', 
    fontSize: 16,
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginLeft: 10,
    marginBottom: 10,
  },
  rememberMeText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#3F3F46',
  },
  btn: {
    width: '100%',
    borderRadius: 50,
    marginTop: 16,
    backgroundColor: '#EE6B22', 
    paddingVertical: 12,
  },
  btnTitle: {
    textAlign: 'center',
  },

  btnCadastroTitledev: {
    color: '#EE6B22',
  },
  btnCadastroContainer: {
    marginTop: 16,
  },
  btnCadastroTitle: {
    color: 'white', 
    fontSize: 14,
    fontWeight: '500',
  },
});