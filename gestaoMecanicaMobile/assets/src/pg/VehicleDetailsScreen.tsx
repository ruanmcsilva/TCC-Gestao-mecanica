import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, User } from 'lucide-react-native';
import api from '../config/api';

export default function VehicleDetailsScreen({ route, navigation }: any) {
  const { vehicle } = route.params || {};
  
  const [loading, setLoading] = useState(false);
  
  // Estados para exibição e salvamento
  const [clienteNome] = useState(vehicle?.cliente_nome || 'Não identificado');
  const [clienteId] = useState(vehicle?.cliente || '');
  
  const [placa, setPlaca] = useState(vehicle?.placa || '');
  const [marca, setMarca] = useState(vehicle?.marca || '');
  const [modelo, setModelo] = useState(vehicle?.modelo || '');
  const [ano, setAno] = useState(vehicle?.ano?.toString() || '');
  const [observacoes, setObservacoes] = useState(vehicle?.observacoes || '');

  const handleSave = async () => {
    if (!placa || !modelo || !clienteId) {
      Alert.alert("Atenção", "Placa, Modelo e Proprietário são obrigatórios.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        placa: placa.toUpperCase(),
        marca: marca,
        modelo: modelo,
        ano: ano ? parseInt(ano) : null,
        observacoes: observacoes,
        cliente: clienteId, 
      };

      if (vehicle?.id) {
        await api.put(`/motos/${vehicle.id}/`, payload);
        Alert.alert("Sucesso", "Veículo atualizado!");
      } else {
        await api.post('/motos/', payload);
        Alert.alert("Sucesso", "Veículo cadastrado!");
      }

      navigation.goBack();
    } catch (error: any) {
      console.error("Erro ao salvar:", error.response?.data || error.message);
      Alert.alert("Erro", "Não foi possível salvar os dados. Verifique a placa.");
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
        <Text style={styles.headerTitle}>{vehicle?.id ? 'Editar Veículo' : 'Novo Veículo'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* PROPRIETÁRIO (Apenas Leitura) */}
        <Text style={styles.label}>Proprietário(a)</Text>
        <View style={styles.clientDisplay}>
          <User color="#EE6B22" size={20} />
          <Text style={styles.clientNameText}>{clienteNome}</Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.label}>Placa do Veículo</Text>
        <TextInput 
          style={[styles.input, styles.plateInput]} 
          value={placa} 
          onChangeText={setPlaca} 
          placeholder="AAA0A00" 
          autoCapitalize="characters" 
          maxLength={7}
        />

        <Text style={styles.label}>Marca</Text>
        <TextInput 
          style={styles.input} 
          value={marca} 
          onChangeText={setMarca} 
          placeholder="Ex: Honda, Yamaha..." 
        />

        <Text style={styles.label}>Modelo da Moto</Text>
        <TextInput 
          style={styles.input} 
          value={modelo} 
          onChangeText={setModelo} 
          placeholder="Ex: CG 160 Titan" 
        />

        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Ano</Text>
            <TextInput 
              style={styles.input} 
              value={ano} 
              onChangeText={setAno} 
              keyboardType="numeric" 
              placeholder="Ex: 2024"
              maxLength={4}
            />
          </View>
        </View>

        <Text style={styles.label}>Observações / Detalhes</Text>
        <TextInput 
          style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
          value={observacoes} 
          onChangeText={setObservacoes} 
          multiline 
          placeholder="Cor, detalhes adicionais..." 
        />

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
              <Text style={styles.saveButtonText}>SALVAR VEÍCULO</Text>
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
  clientDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3ED',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#F97316'
  },
  clientNameText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginLeft: 10
  },
  plateInput: { fontSize: 18, fontWeight: 'bold', letterSpacing: 2, color: '#F97316' },
  row: { flexDirection: 'row' },
  divider: { height: 1, backgroundColor: '#D1D5DB', marginBottom: 20 },
  saveButton: {
    backgroundColor: '#EE6B22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 15, borderRadius: 8, marginTop: 10, elevation: 3
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});