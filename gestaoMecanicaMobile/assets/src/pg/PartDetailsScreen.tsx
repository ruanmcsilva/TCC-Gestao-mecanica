import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save } from 'lucide-react-native';
import api from '../config/api';

export default function PartDetailsScreen({ route, navigation }: any) {
  const { part } = route.params || {};
  const isEditing = !!part;

  const [nome, setNome] = useState(part?.nome || '');
  const [numeroSerie, setNumeroSerie] = useState(part?.numero_serie || '');
  const [qtdEstoque, setQtdEstoque] = useState(part?.quantidade_em_estoque?.toString() || '');
  const [precoCusto, setPrecoCusto] = useState(part?.preco_custo?.toString() || '');
  const [precoVenda, setPrecoVenda] = useState(part?.preco_venda?.toString() || '');
  const [descricao, setDescricao] = useState(part?.descricao || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!nome || !qtdEstoque || !precoVenda) {
      Alert.alert('Aviso', 'Por favor, preencha os campos obrigatórios (Nome, Qtd. Estoque, Preço de Venda).');
      return;
    }

    const payload = {
      nome,
      numero_serie: numeroSerie,
      quantidade_em_estoque: Number(qtdEstoque),
      preco_custo: precoCusto ? Number(precoCusto) : null,
      preco_venda: Number(precoVenda),
      descricao,
    };

    try {
      setLoading(true);
      if (isEditing) {
        await api.put(`/pecas/${part.id}/`, payload);
        Alert.alert('Sucesso', 'Peça atualizada com sucesso!');
      } else {
        await api.post('/pecas/', payload);
        Alert.alert('Sucesso', 'Peça cadastrada com sucesso!');
      }
      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar peça:", error);
      Alert.alert('Erro', 'Ocorreu um erro ao salvar a peça. Tente novamente.');
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
        <Text style={styles.headerTitle}>{isEditing ? 'Editar Peça' : 'Nova Peça'}</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>Nome da Peça *</Text>
        <TextInput style={styles.input} value={nome} onChangeText={setNome} placeholder="Ex: Filtro de Óleo" />

        <Text style={styles.label}>N° de Série (Opcional)</Text>
        <TextInput style={styles.input} value={numeroSerie} onChangeText={setNumeroSerie} placeholder="Ex: 123456789" />

        <View style={styles.row}>
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.label}>Qtd. Estoque *</Text>
            <TextInput style={styles.input} value={qtdEstoque} onChangeText={setQtdEstoque} keyboardType="numeric" placeholder="Ex: 10" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Preço de Custo</Text>
            <TextInput style={styles.input} value={precoCusto} onChangeText={setPrecoCusto} keyboardType="numeric" placeholder="Ex: 30.50" />
          </View>
        </View>

        <Text style={styles.label}>Preço de Venda *</Text>
        <TextInput style={styles.input} value={precoVenda} onChangeText={setPrecoVenda} keyboardType="numeric" placeholder="Ex: 50.00" />

        <Text style={styles.label}>Descrição/Observações</Text>
        <TextInput 
          style={[styles.input, styles.textArea]} 
          value={descricao} 
          onChangeText={setDescricao} 
          multiline 
          numberOfLines={4} 
          placeholder="Adicione detalhes sobre a peça..."
        />

        <TouchableOpacity style={[styles.saveButton, loading && { opacity: 0.7 }]} onPress={handleSave} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Save color="white" size={20} />
              <Text style={styles.saveButtonText}>{isEditing ? 'ATUALIZAR PEÇA' : 'SALVAR PEÇA'}</Text>
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
  textArea: { height: 100, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  saveButton: {
    backgroundColor: '#EE6B22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    padding: 15, borderRadius: 8, marginTop: 10
  },
  saveButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16, marginLeft: 10 }
});
