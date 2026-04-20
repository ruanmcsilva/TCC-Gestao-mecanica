import React, { useState } from 'react';
import { Formik } from 'formik';
import { useNavigation, CommonActions } from '@react-navigation/native';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Input, Button, Icon } from '@rneui/themed';
import { useAuth } from '../components/AuthContext';
import * as Yup from 'yup';

const regrasValidacaoYup = Yup.object().shape({
  nome: Yup.string().required('Nome é obrigatório'),
  email: Yup.string().email('Digite um e-mail válido').required('E-mail é obrigatório'),
  idade: Yup.number().typeError('Digite apenas números').required('Idade é obrigatória').min(1, 'Idade inválida').max(120, 'Idade inválida'),
  sexo: Yup.string().required('Sexo é obrigatório'),
  senha: Yup.string().required('Senha é obrigatória').min(8, 'A senha deve ter no mínimo 8 caracteres'),
});

export default function CadastroScreen() {
  const navigation = useNavigation();
  const { createUserWithEmailAndPassword } = useAuth(); 
  const [showPassword, setShowPassword] = useState(false);

  const PasswordAccessory = () => (
    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
      <Icon type="font-awesome" name={showPassword ? 'eye-slash' : 'eye'} size={22} color="#6B7280" />
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="chevron-left" type="font-awesome" color="#1A2E05" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Criar Conta</Text>
        <View style={styles.headerPlaceholder} /> 
      </View>

      <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
        <Formik
          initialValues={{ nome: '', email: '', idade: '', sexo: '', senha: '' }}
          validationSchema={regrasValidacaoYup}
          onSubmit={async (dados) => {
            await createUserWithEmailAndPassword(dados); 
            navigation.dispatch(
              CommonActions.reset({
                index: 0,
                routes: [{ name: 'Home' }],
              })
            );
          }}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
            <View style={styles.formContainer}>
              <Input
                label="Nome Completo"
                labelStyle={styles.label}
                placeholder="Digite seu nome"
                leftIcon={{ name: 'person', color: '#9CA3AF' }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                onChangeText={handleChange('nome')}
                onBlur={handleBlur('nome')}
                value={values.nome}
                errorMessage={touched.nome && errors.nome ? errors.nome : ''}
              />

              <Input
                label="E-mail"
                labelStyle={styles.label}
                placeholder="seu.email@exemplo.com"
                leftIcon={{ name: 'email', color: '#9CA3AF' }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                value={values.email}
                errorMessage={touched.email && errors.email ? errors.email : ''}
                keyboardType="email-address"
              />

              <Input
                label="Idade"
                labelStyle={styles.label}
                placeholder="Sua idade"
                leftIcon={{ name: 'cake', color: '#9CA3AF' }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                onChangeText={handleChange('idade')}
                onBlur={handleBlur('idade')}
                value={values.idade}
                keyboardType="numeric"
                errorMessage={touched.idade && errors.idade ? errors.idade : ''}
              />

              <Input
                label="Sexo"
                labelStyle={styles.label}
                placeholder="Como você se identifica?"
                leftIcon={{ name: 'wc', color: '#9CA3AF' }}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                onChangeText={handleChange('sexo')}
                onBlur={handleBlur('sexo')}
                value={values.sexo}
                errorMessage={touched.sexo && errors.sexo ? errors.sexo : ''}
              />

              <Input
                label="Senha"
                labelStyle={styles.label}
                placeholder="Crie uma senha forte"
                leftIcon={{ name: 'lock', color: '#9CA3AF' }}
                rightIcon={<PasswordAccessory />}
                inputContainerStyle={styles.inputContainer}
                inputStyle={styles.inputStyle}
                onChangeText={handleChange('senha')}
                onBlur={handleBlur('senha')}
                value={values.senha}
                secureTextEntry={!showPassword}
                errorMessage={touched.senha && errors.senha ? errors.senha : ''}
              />

              <Button
                title="Cadastrar"
                onPress={handleSubmit}
                buttonStyle={styles.btn}
                titleStyle={styles.btnTitle}
              />

              <Button
                title="Já tem conta? Voltar para o Login"
                onPress={() => navigation.navigate('Login')}
                type="clear"
                titleStyle={styles.btnVoltarTitle}
                containerStyle={styles.btnVoltarContainer}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: '#F0FDF4',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 50 : 30,
    paddingBottom: 12,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A2E05',
    textAlign: 'center',
  },
  headerPlaceholder: {
    width: 40,
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
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
  },
  inputStyle: {
    color: '#1E293B',
    fontSize: 16,
  },
  btn: {
    width: '100%',
    borderRadius: 10,
    marginTop: 16,
    backgroundColor: '#65A30D',
    paddingVertical: 12,
  },
  btnTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  btnVoltarContainer: {
    marginTop: 16,
  },
  btnVoltarTitle: {
    color: '#4D7C0F',
    fontSize: 14,
    fontWeight: '500',
  }
});
