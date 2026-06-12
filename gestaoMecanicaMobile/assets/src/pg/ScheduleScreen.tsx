import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { ArrowLeft, Calendar, Plus, X } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import * as Linking from 'expo-linking';
export default function ScheduleScreen({ navigation }: any) {
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [clientes, setClientes] = useState<any[]>([]);
  const [motos, setMotos] = useState<any[]>([]);
  const [selectedCliente, setSelectedCliente] = useState('');
  const [selectedMoto, setSelectedMoto] = useState('');
  const today = new Date();
  const defaultDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
  const [dateStr, setDateStr] = useState(defaultDate);
  const [timeStr, setTimeStr] = useState('08:00');
  const [descricao, setDescricao] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await api.get('/agendamento/?page_size=1000');
      setSchedules(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      Alert.alert('Erro', 'Não foi possível carregar a agenda.');
    } finally {
      setLoading(false);
    }
  };
  const fetchClientes = async () => {
    try {
      const response = await api.get('/clientes/?page_size=1000');
      const clientesData = response.data.results || response.data;
      setClientes(clientesData.filter((c: any) => c.nome !== 'CONSUMIDOR PADRAO' && c.nome !== 'VENDA BALCÃO' && c.nome !== 'VENDA BALCAO'));
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };
  const fetchMotos = async (clienteId: string) => {
    try {
      const response = await api.get(`/motos/?cliente=${clienteId}&page_size=1000`);
      setMotos(response.data.results || response.data);
    } catch (error) {
      console.error('Erro ao buscar motos:', error);
    }
  };
  useFocusEffect(
    useCallback(() => {
      fetchSchedules();
      fetchClientes();
    }, [])
  );
  const handleClienteChange = (itemValue: string) => {
    setSelectedCliente(itemValue);
    setSelectedMoto('');
    if (itemValue) {
      fetchMotos(itemValue);
    } else {
      setMotos([]);
    }
  };
  const handleSave = async () => {
    if (!selectedCliente || !selectedMoto || !dateStr || !timeStr) {
      Alert.alert('Aviso', 'Preencha Cliente, Moto, Data e Horário.');
      return;
    }
    const parts = dateStr.split('/');
    if (parts.length !== 3) {
      Alert.alert('Aviso', 'Data deve estar no formato DD/MM/AAAA');
      return;
    }
    const isoDate = `${parts[2]}-${parts[1]}-${parts[0]}`;
    const payload = {
      cliente: selectedCliente,
      moto: selectedMoto,
      data: isoDate,
      hora: timeStr,
      descricao_problema: descricao,
      status: 'PENDENTE'
    };
    try {
      setIsSubmitting(true);
      const response = await api.post('/agendamento/', payload);
      Alert.alert('Sucesso', 'Agendado com sucesso!');
      setModalVisible(false);
      resetForm();
      fetchSchedules();
      if (response.data.whatsapp_link) {
        Linking.openURL(response.data.whatsapp_link);
      }
    } catch (error: any) {
      console.error('Erro ao salvar:', error.response?.data);
      Alert.alert('Erro', error.response?.data?.erro || 'Erro ao agendar.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const resetForm = () => {
    setSelectedCliente('');
    setSelectedMoto('');
    setDateStr(defaultDate);
    setTimeStr('08:00');
    setDescricao('');
  };
  const formatDate = (isoString: string) => {
    if (!isoString) return '';
    const [year, month, day] = isoString.split('-');
    return `${day}/${month}/${year}`;
  };
  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agenda Técnica</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.actionsContainer}>
        <Text style={styles.subtitle}>Controle de horários e produtividade</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Plus color="white" size={20} />
          <Text style={styles.addButtonText}>NOVO AGENDAMENTO</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
        </View>
      ) : (
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhum agendamento encontrado.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardIcon}>
                <Calendar color="#EE6B22" size={24} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.clientName}>{item.cliente_nome || 'Cliente'}</Text>
                <Text style={styles.serviceName}>{item.moto_modelo} • {item.moto_placa}</Text>
                <Text style={styles.date}>{formatDate(item.data)} às {item.hora?.slice(0, 5)}</Text>
              </View>
              <View>
                <Text style={[
                  styles.status,
                  item.status === 'CONFIRMADO' ? styles.statusGreen :
                    item.status === 'CONCLUIDO' ? styles.statusBlue : styles.statusYellow
                ]}>
                  {item.status}
                </Text>
              </View>
            </View>
          )}
        />
      )}
      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Novo Agendamento</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <X color="#6B7280" size={24} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.label}>Cliente *</Text>
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={selectedCliente}
                  onValueChange={handleClienteChange}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione o Cliente" value="" color="#9CA3AF" />
                  {clientes.map(c => (
                    <Picker.Item key={c.id} label={c.nome} value={c.id} />
                  ))}
                </Picker>
              </View>
              <Text style={styles.label}>Moto do Cliente *</Text>
              <View style={[styles.pickerContainer, !selectedCliente && { opacity: 0.5 }]}>
                <Picker
                  selectedValue={selectedMoto}
                  onValueChange={setSelectedMoto}
                  enabled={!!selectedCliente}
                  style={styles.picker}
                >
                  <Picker.Item label="Selecione a Moto" value="" color="#9CA3AF" />
                  {motos.map(m => (
                    <Picker.Item key={m.id} label={`${m.modelo} (${m.placa})`} value={m.id} />
                  ))}
                </Picker>
              </View>
              <View style={styles.row}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <Text style={styles.label}>Data (DD/MM/AAAA) *</Text>
                  <TextInput
                    style={styles.input}
                    value={dateStr}
                    onChangeText={setDateStr}
                    placeholder="Ex: 25/12/2023"
                    keyboardType="numeric"
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Horário (HH:MM) *</Text>
                  <TextInput
                    style={styles.input}
                    value={timeStr}
                    onChangeText={setTimeStr}
                    placeholder="Ex: 08:30"
                    keyboardType="numbers-and-punctuation"
                  />
                </View>
              </View>
              <Text style={styles.label}>Descrição do Problema</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Ex: Troca de óleo, barulho no motor..."
                multiline
                numberOfLines={4}
              />
              <TouchableOpacity
                style={[styles.saveButton, isSubmitting && { opacity: 0.7 }]}
                onPress={handleSave}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>CONFIRMAR AGENDAMENTO</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f5f5f5' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10
  },
  headerTitle: { fontSize: 22, fontWeight: '900', color: '#1F2937', fontStyle: 'italic', textTransform: 'uppercase' },
  actionsContainer: { alignItems: 'center', paddingHorizontal: 20, marginBottom: 15 },
  subtitle: { fontSize: 12, color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  addButton: {
    backgroundColor: '#EE6B22', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: 12, paddingHorizontal: 20, borderRadius: 12, elevation: 3, shadowColor: '#EE6B22', shadowOpacity: 0.3, shadowRadius: 5
  },
  addButtonText: { color: 'white', fontWeight: '900', fontSize: 14, marginLeft: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF', borderRadius: 16, padding: 15, marginBottom: 15,
    flexDirection: 'row', alignItems: 'center', elevation: 2, borderWidth: 1, borderColor: '#F3F4F6'
  },
  cardIcon: { marginRight: 15, backgroundColor: '#FFF3ED', padding: 12, borderRadius: 12 },
  cardInfo: { flex: 1 },
  clientName: { fontSize: 14, fontWeight: '900', color: '#111827', textTransform: 'uppercase' },
  serviceName: { fontSize: 11, color: '#9CA3AF', marginTop: 2, fontWeight: 'bold', textTransform: 'uppercase' },
  date: { fontSize: 13, color: '#EE6B22', marginTop: 4, fontWeight: '900' },
  status: { fontSize: 10, fontWeight: '900', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, overflow: 'hidden', textTransform: 'uppercase' },
  statusGreen: { backgroundColor: '#DCFCE7', color: '#16A34A' },
  statusYellow: { backgroundColor: '#FEF9C3', color: '#CA8A04' },
  statusBlue: { backgroundColor: '#DBEAFE', color: '#2563EB' },
  emptyContainer: { alignItems: 'center', marginTop: 50 },
  emptyText: { color: '#9CA3AF', fontWeight: 'bold', textTransform: 'uppercase', fontSize: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, maxHeight: '90%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1F2937', fontStyle: 'italic', textTransform: 'uppercase' },
  label: { fontSize: 11, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 6, marginTop: 12 },
  input: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    padding: 14, fontSize: 14, color: '#111827', fontWeight: 'bold'
  },
  pickerContainer: {
    backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12,
    overflow: 'hidden'
  },
  picker: { height: 50, width: '100%' },
  row: { flexDirection: 'row' },
  textArea: { height: 100, textAlignVertical: 'top' },
  saveButton: {
    backgroundColor: '#EE6B22', alignItems: 'center', justifyContent: 'center',
    padding: 16, borderRadius: 12, marginTop: 25, marginBottom: 10, elevation: 2
  },
  saveButtonText: { color: 'white', fontWeight: '900', fontSize: 14, textTransform: 'uppercase' }
});
