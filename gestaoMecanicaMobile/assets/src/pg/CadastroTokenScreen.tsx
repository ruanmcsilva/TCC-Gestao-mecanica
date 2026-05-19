import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import api from '../config/api';

export default function CadastroTokenScreen({ navigation }: any) {
  const [token, setToken] = useState('');
  const [nome, setNome] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmaSenha, setConfirmaSenha] = useState('');
  const [showSenha, setShowSenha] = useState(false);
  const [showConfirma, setShowConfirma] = useState(false);
  const [loading, setLoading] = useState(false);

  const [validations, setValidations] = useState({
    minChars: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });

  useEffect(() => {
    setValidations({
      minChars: senha.length >= 8,
      upper: /[A-Z]/.test(senha),
      lower: /[a-z]/.test(senha),
      number: /[0-9]/.test(senha),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(senha),
    });
  }, [senha]);

  const handleSubmit = async () => {
    if (!Object.values(validations).every((v) => v)) {
      Alert.alert('Erro', 'A senha não atende aos requisitos de segurança.');
      return;
    }

    if (senha !== confirmaSenha) {
      Alert.alert('Erro', 'As senhas não coincidem!');
      return;
    }

    if (!token || !nome) {
      Alert.alert('Erro', 'Preencha o Token e o Nome.');
      return;
    }

    setLoading(true);

    try {
      await api.post('/registrar-com-token/', {
        token,
        nome,
        senha,
        confirmacao_senha: confirmaSenha
      });

      Alert.alert('Sucesso', 'Conta criada com sucesso! Faça login para continuar.');
      navigation.navigate('Login');
    } catch (error: any) {
      const msg = error.response?.data?.error || 'Erro ao registrar conta. Token inválido ou expirado.';
      Alert.alert('Erro', msg);
    } finally {
      setLoading(false);
    }
  };

  const Requisito = ({ label, met }: { label: string; met: boolean }) => (
    <View style={styles.requisitoContainer}>
      <MaterialCommunityIcons 
        name={met ? "check-circle" : "circle-outline"} 
        size={16} 
        color={met ? "#F97316" : "#9CA3AF"} 
      />
      <Text style={[styles.requisitoText, { color: met ? "#F97316" : "#6B7280" }]}>
        {label}
      </Text>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Finalizar Cadastro</Text>
      <Text style={styles.subtitle}>Insira o token recebido por e-mail e crie sua senha.</Text>

      <Text style={styles.label}>Token de Acesso</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 123e4567-e89b-12d3..."
        value={token}
        onChangeText={setToken}
        autoCapitalize="none"
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Nome Completo</Text>
      <TextInput
        style={styles.input}
        placeholder="Digite seu nome"
        value={nome}
        onChangeText={setNome}
        placeholderTextColor="#9CA3AF"
      />

      <Text style={styles.label}>Nova Senha</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Crie uma senha forte"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!showSenha}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={() => setShowSenha(!showSenha)}>
          <MaterialCommunityIcons name={showSenha ? "eye-off" : "eye"} size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <View style={styles.validationsContainer}>
        <Requisito label="Mín. 8 caracteres" met={validations.minChars} />
        <Requisito label="Letra maiúscula" met={validations.upper} />
        <Requisito label="Letra minúscula" met={validations.lower} />
        <Requisito label="Número" met={validations.number} />
        <Requisito label="Caractere especial" met={validations.special} />
      </View>

      <Text style={styles.label}>Confirmar Senha</Text>
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Repita a senha"
          value={confirmaSenha}
          onChangeText={setConfirmaSenha}
          secureTextEntry={!showConfirma}
          placeholderTextColor="#9CA3AF"
        />
        <TouchableOpacity onPress={() => setShowConfirma(!showConfirma)}>
          <MaterialCommunityIcons name={showConfirma ? "eye-off" : "eye"} size={24} color="#9CA3AF" />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Criando Conta..." : "Finalizar Cadastro"}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.voltarButton} onPress={() => navigation.goBack()}>
        <Text style={styles.voltarText}>Voltar para o Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#000',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    color: '#9CA3AF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 30,
  },
  label: {
    color: '#F97316',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    marginBottom: 15,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  passwordInput: {
    flex: 1,
    color: '#FFF',
    paddingVertical: 12,
  },
  validationsContainer: {
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  requisitoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  requisitoText: {
    marginLeft: 8,
    fontSize: 12,
  },
  button: {
    backgroundColor: '#F97316',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
  voltarButton: {
    marginTop: 20,
    alignItems: 'center',
  },
  voltarText: {
    color: '#F97316',
    fontSize: 14,
  }
});