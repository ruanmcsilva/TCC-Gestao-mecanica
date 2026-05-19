import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import api from '../config/api'; // Sua config com o IP 192.168.0.123

export default function ClientDetailsScreen({ route, navigation }: any) {
  const { client } = route.params || {};
  
  // Estados usando os nomes do seu banco no Django
  const [loading, setLoading] = useState(false);
  const [nome, setNome] = useState(client?.nome || client?.name || '');
  const [telefone, setTelefone] = useState(client?.telefone || client?.phone || '');
  const [email, setEmail] = useState(client?.email || '');
  const [cpf, setCpf] = useState(client?.cpf_cnpj || '');
  const [cep, setCep] = useState(client?.cep || '');
  const [endereco, setEndereco] = useState(client?.endereco || '');

  const handleSave = async () => {
    if (!nome || !telefone) {
      Alert.alert("Atenção", "Nome e Telefone são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        nome: nome,
        telefone: telefone,
        email: email,
        cpf_cnpj: cpf,
        cep: cep,
        endereco: endereco,
      };

      if (client?.id) {
        // Se tem ID, estamos EDITANDO (PUT)
        await api.put(`/clientes/${client.id}/`, payload);
        Alert.alert("Sucesso", "Cliente atualizado com sucesso!");
      } else {
        // Se não tem ID, estamos CRIANDO (POST)
        await api.post('/clientes/', payload);
        Alert.alert("Sucesso", "Cliente cadastrado com sucesso!");
      }

      navigation.goBack(); // Volta para a lista para ver o resultado
    } catch (error: any) {
      console.error("Erro ao salvar cliente:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível salvar os dados no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {client?.id ? 'Editar Cliente' : 'Novo Cliente'}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Nome completo" />

        <Text style={styles.label}>Telefone</Text>
        <TextInput style={styles.input} value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" placeholder="(00) 00000-0000" />

        <Text style={styles.label}>Email</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="exemplo@email.com" />

        <Text style={styles.label}>CPF/CNPJ</Text>
        <TextInput style={styles.input} value={cpf} onChangeText={setCpf} keyboardType="numeric" placeholder="Apenas números" />

        <Text style={styles.label}>CEP</Text>
        <TextInput style={styles.input} value={cep} onChangeText={setCep} keyboardType="numeric" placeholder="Apenas números" />

        <Text style={styles.label}>Endereço Completo</Text>
        <TextInput style={[styles.input, { height: 80, textAlignVertical: 'top' }]} value={endereco} onChangeText={setEndereco} multiline placeholder="Rua, número, bairro..." />

        <TouchableOpacity 
          style={[styles.saveButton, { opacity: loading ? 0.7 : 1 }]} 
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save color="white" size={20} />
              <Text style={styles.saveButtonText}>SALVAR NO SISTEMA</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#4B5563', marginBottom: 5 },
  input: {
    backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 8,
    padding: 12, marginBottom: 15, fontSize: 16, color: '#111827'
  },
  saveButton: {
    backgroundColor: '#EE6B22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 15, borderRadius: 8, marginTop: 10, elevation: 3
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});