import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Linking, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Plus, Camera, Printer, CreditCard } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { generatePixPayload } from '../utils/pix';

export default function ServiceDetailsScreen({ route, navigation }: any) {

  const { service: initialService } = route.params || {};
  
 
  const [loading, setLoading] = useState(initialService?.id ? true : false);
  const [uploading, setUploading] = useState(false);
  const [service, setService] = useState<any>(initialService || null);
  const [parts, setParts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [pixModalVisible, setPixModalVisible] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  
  const [addPartModalVisible, setAddPartModalVisible] = useState(false);
  const [availableParts, setAvailableParts] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<string>('');
  const [partQty, setPartQty] = useState('1');
  const [searchQuery, setSearchQuery] = useState('');

  const [description, setDescription] = useState(initialService?.descricao || '');
  const [laborCost, setLaborCost] = useState(initialService?.valor_mao_de_obra?.toString() || '0');
  const [status, setStatus] = useState(initialService?.status || 'PENDENTE');
  const [km, setKm] = useState(initialService?.kilometragem?.toString() || '0');

  const fetchServiceData = async () => {
    if (!initialService?.id) {
        setLoading(false);
        return;
    }
    
    try {
      setLoading(true);
      const [serviceRes, partsRes, photosRes] = await Promise.all([
        api.get(`/servicos/${initialService.id}/`),
        api.get(`/itens-servico/?servico=${initialService.id}`),
        api.get(`/fotos/?servico=${initialService.id}`)
      ]);
      
      setService(serviceRes.data);
      setParts(partsRes.data.results || partsRes.data || []);
      setPhotos(photosRes.data.results || photosRes.data || []);
      
      setDescription(serviceRes.data.descricao);
      setLaborCost(serviceRes.data.valor_mao_de_obra.toString());
      setStatus(serviceRes.data.status);
      setKm(serviceRes.data.kilometragem.toString());
    } catch (error) {
      console.error("Erro ao carregar detalhes da OS:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados desta OS.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceData();
  }, [initialService?.id]);

  const uploadPhoto = async (uri: string) => {
    if (!service?.id) {
      Alert.alert("Aviso", "Salve a Ordem de Serviço antes de anexar fotos.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('descricao', 'Enviado do dispositivo móvel');
      formData.append('servico', String(service.id));

      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      // @ts-ignore
      formData.append('foto', {
        uri: uri,
        name: `os_${service.id}_photo.${fileType}`,
        type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
      });

      await api.post('/fotos/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert("Sucesso", "Foto anexada com sucesso!");
      fetchServiceData();
    } catch (error: any) {
      Alert.alert("Erro", "Falha ao enviar foto para o servidor.");
    } finally {
      setUploading(false);
    }
  };

  const handlePickPhoto = async () => {
    Alert.alert(
      "Selecionar Foto",
      "Escolha de onde deseja pegar a imagem:",
      [
        {
          text: "Câmera",
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert("Erro", "Permissão negada.");
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled) uploadPhoto(result.assets[0].uri);
          }
        },
        {
          text: "Galeria",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled) uploadPhoto(result.assets[0].uri);
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleSaveOS = async () => {
    try {
      const payload = {
        descricao: description,
        valor_mao_de_obra: parseFloat(laborCost),
        status: status,
        kilometragem: parseInt(km),
      };

      if (service?.id) {
        await api.patch(`/servicos/${service.id}/`, payload);
        Alert.alert("Sucesso", "Ordem de Serviço atualizada!");
      } else {

        const response = await api.post(`/servicos/`, payload);
        setService(response.data);
        Alert.alert("Sucesso", "Nova Ordem de Serviço criada!");
      }
      fetchServiceData();
    } catch (error) {
      Alert.alert("Erro", "Falha ao salvar. Verifique os campos obrigatórios.");
    }
  };

const handlePrint = async () => {
  if (!service?.id) return;
  
  try {
    const url = `${api.defaults.baseURL}/servicos/${service.id}/imprimir_os/`;
    const fileUri = `${FileSystem.documentDirectory}OS_${service.id}.pdf`;
    const token = await AsyncStorage.getItem('@app_token');

    const downloadResult = await FileSystem.downloadAsync(url, fileUri, {
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      }
    });

    if (downloadResult.status !== 200) {
      throw new Error(`Falha ao baixar PDF. Status ${downloadResult.status}`);
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(downloadResult.uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Ordem de Serviço ${service.id}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert("Erro", "O compartilhamento não está disponível neste dispositivo.");
    }

  } catch (error) {
    console.error(error);
    Alert.alert("Erro", "Falha ao baixar e abrir o PDF da Ordem de Serviço.");
  }
};

  const handlePaymentOptions = () => {
    setPaymentModalVisible(true);
  };

  const confirmPayment = (metodo: string) => {
    Alert.alert("Confirmar", `Finalizar OS e marcar como pago via ${metodo}?`, [
      { text: "Sim", onPress: async () => {
          setLoading(true);
          setPaymentModalVisible(false);
          setPixModalVisible(false);
          try {
            await api.post(`/pagamentos/servico/${service.id}/marcar-pago/`, { metodo });
            Alert.alert("Sucesso", "Pagamento registrado e OS finalizada!");
            fetchServiceData();
          } catch (err: any) {
            Alert.alert("Erro", err.response?.data?.message || "Erro ao confirmar pagamento.");
          } finally {
            setLoading(false);
          }
      }},
      { text: "Não", style: "cancel" }
    ]);
  };

  const handleGeneratePix = () => {
    if (!service?.valor_total_servico) return;
    const pixKey = 'b9d06bed-a343-4c04-9cb1-67b50cac0c6e';
    const payload = generatePixPayload(pixKey, 'MECANICA', 'SAO PAULO', service.valor_total_servico, `OS${service.id}`);
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(payload)}&bgcolor=ffffff&color=000000`;
    setQrCodeUrl(url);
    setPaymentModalVisible(false);
    setPixModalVisible(true);
  };

  const openAddPartModal = async () => {
    setAddPartModalVisible(true);
    try {
      const res = await api.get('/pecas/?page_size=1000');
      const partsList = res.data.results || res.data || [];
      setAvailableParts(partsList);
      if (partsList.length > 0) {
        setSelectedPartId(partsList[0].id.toString());
      }
    } catch (err) {
      console.log('Erro ao carregar pecas', err);
    }
  };

  const handleAddManualPart = async () => {
    if (!selectedPartId || !partQty) {
      Alert.alert('Aviso', 'Selecione a peça e informe a quantidade.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/itens-servico/', {
        servico: service.id,
        peca: parseInt(selectedPartId),
        quantidade_utilizada: parseInt(partQty),
      });
      setAddPartModalVisible(false);
      Alert.alert('Sucesso', 'Peça adicionada à OS.');
      fetchServiceData();
    } catch (err) {
      Alert.alert('Erro', 'Não foi possível adicionar a peça.');
      setLoading(false);
    }
  };




  if (loading) return <ActivityIndicator size="large" color="#EE6B22" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={28} />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePrint} disabled={!service?.id}>
          <Printer color={service?.id ? "#4B5563" : "#D1D5DB"} size={24} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.darkCard}>
          <Text style={styles.darkCardLabel}>CLIENTE / VEÍCULO</Text>
          <Text style={styles.darkCardName}>{service?.cliente_nome || 'Selecione o Cliente'}</Text>
          <Text style={styles.darkCardSub}>{service?.responsavel_nome ? `Mecânico: ${service.responsavel_nome}` : 'Mecânico Admin'}</Text>
          <View style={styles.badgePlaca}>
             <Text style={styles.placaText}>{service?.moto_placa || 'PLACA'}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalhamento Técnico</Text>
          <Text style={styles.label}>Descrição do Serviço</Text>
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            value={description} 
            onChangeText={setDescription} 
            multiline 
          />
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
               <Text style={styles.label}>KM Atual</Text>
               <TextInput style={styles.input} value={km} onChangeText={setKm} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
               <Text style={styles.label}>Status</Text>
               <TouchableOpacity 
                 style={[styles.statusBadge, { backgroundColor: status === 'CONCLUIDO' ? '#16A34A' : '#2563EB' }]}
                 onPress={() => setStatus(status === 'PENDENTE' ? 'EM_ANDAMENTO' : status === 'EM_ANDAMENTO' ? 'CONCLUIDO' : 'PENDENTE')}
               >
                 <Text style={styles.statusBadgeText}>{status}</Text>
               </TouchableOpacity>
            </View>
          </View>
        </View>

        {service?.id && (
          <>
            <View style={styles.section}>
              <View style={styles.rowJustified}>
                <Text style={styles.sectionTitle}>Fotos do Serviço</Text>
                <TouchableOpacity style={styles.smallBtn} onPress={handlePickPhoto} disabled={uploading}>
                  {uploading ? <ActivityIndicator size="small" color="#F97316" /> : <Camera size={16} color="#F97316" />}
                </TouchableOpacity>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
                {photos.map(p => (
                  <Image 
                    key={p.id}
                    source={{ uri: p.foto.startsWith('http') ? p.foto : `${api.defaults.baseURL?.replace('/api/v1', '')}${p.foto}` }} 
                    style={styles.photoThumb} 
                  />
                ))}
                {photos.length === 0 && <Text style={styles.emptyText}>Nenhuma foto anexada.</Text>}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.rowJustified}>
                <Text style={styles.sectionTitle}>Peças Utilizadas</Text>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <TouchableOpacity style={styles.smallBtn} onPress={openAddPartModal}>
                    <Plus size={16} color="#F97316" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('ScannerNf', { servicoId: service?.id })}>
                    <Camera size={16} color="#F97316" />
                  </TouchableOpacity>
                </View>
              </View>
              {parts.map((item) => (
                <View key={item.id} style={styles.partItem}>
                  <View>
                    <Text style={styles.partName}>{item.peca_nome || 'Peça'}</Text>
                    <Text style={styles.partQty}>{item.quantidade_utilizada}x Unidades</Text>
                  </View>
                  <Text style={styles.partPrice}>R$ {(item.quantidade_utilizada * item.valor_unitario_na_epoca).toFixed(2)}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Financeiro</Text>
          <View style={styles.rowJustified}>
            <Text style={styles.financeLabel}>Mão de Obra</Text>
            <TextInput style={styles.financeInput} value={laborCost} onChangeText={setLaborCost} keyboardType="numeric" />
          </View>
          <View style={styles.rowJustified}>
            <Text style={styles.financeLabel}>Total em Peças</Text>
            <Text style={styles.financeValue}>R$ {service?.valor_total_pecas?.toFixed(2) || '0.00'}</Text>
          </View>
          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>TOTAL GERAL</Text>
            <Text style={styles.totalAmount}>R$ {service?.valor_total_servico?.toFixed(2) || '0.00'}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveOS}>
          <Save color="white" size={20} />
          <Text style={styles.saveButtonText}>{service?.id ? 'SALVAR ALTERAÇÕES' : 'CRIAR ORDEM DE SERVIÇO'}</Text>
        </TouchableOpacity>

        {service?.id && status !== 'CONCLUIDO' && (
          <TouchableOpacity style={styles.payButton} onPress={handlePaymentOptions}>
            <CreditCard color="white" size={20} />
            <Text style={styles.saveButtonText}>RECEBER PAGAMENTO</Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <Modal visible={paymentModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Como o cliente pagou?</Text>
            
            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#10B981' }]} onPress={handleGeneratePix}>
              <Text style={styles.payOptionText}>PIX (Gerar QR Code)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#F59E0B' }]} onPress={() => confirmPayment('DINHEIRO')}>
              <Text style={styles.payOptionText}>Dinheiro em Espécie</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.payOptionBtn} onPress={() => confirmPayment('CARTÃO CRÉDITO')}>
              <Text style={styles.payOptionText}>Cartão de Crédito (Maquininha)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.payOptionBtn} onPress={() => confirmPayment('CARTÃO DÉBITO')}>
              <Text style={styles.payOptionText}>Cartão de Débito (Maquininha)</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#EF4444', marginTop: 10 }]} onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.payOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={pixModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <Text style={styles.modalTitle}>QR Code Pix</Text>
            <Text style={{ textAlign: 'center', marginBottom: 20, color: '#64748b' }}>Mostre esta tela para o cliente escanear o QR Code no app do banco.</Text>
            
            {qrCodeUrl ? (
              <View style={{ padding: 15, backgroundColor: 'white', borderRadius: 20, elevation: 5, marginBottom: 30 }}>
                <Image source={{ uri: qrCodeUrl }} style={{ width: 250, height: 250 }} />
              </View>
            ) : null}

            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#16A34A', width: '100%' }]} onPress={() => confirmPayment('PIX')}>
              <Text style={styles.payOptionText}>Confirmar Pagamento Realizado</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#EF4444', width: '100%', marginTop: 5 }]} onPress={() => setPixModalVisible(false)}>
              <Text style={styles.payOptionText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={addPartModalVisible} transparent={true} animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Adicionar Peça (Estoque)</Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 10, paddingHorizontal: 15, marginBottom: 15 }}>
              <TextInput 
                style={{ flex: 1, paddingVertical: 12, color: '#1e293b' }}
                placeholder="🔍 Buscar peça pelo nome..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            
            <View style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 10, marginBottom: 15, backgroundColor: '#f8fafc' }}>
              <Picker
                selectedValue={selectedPartId}
                onValueChange={(itemValue) => setSelectedPartId(itemValue)}
              >
                {availableParts
                  .filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((p) => (
                    <Picker.Item key={p.id} label={`${p.nome} (Estoque: ${p.quantidade_em_estoque})`} value={p.id.toString()} />
                  ))
                }
              </Picker>
            </View>

            <Text style={styles.label}>Quantidade</Text>
            <TextInput 
              style={styles.input} 
              value={partQty} 
              onChangeText={setPartQty} 
              keyboardType="numeric" 
            />

            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#EE6B22' }]} onPress={handleAddManualPart}>
              <Text style={styles.payOptionText}>Adicionar Peça Manual</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.payOptionBtn, { backgroundColor: '#EF4444', marginTop: 10 }]} onPress={() => setAddPartModalVisible(false)}>
              <Text style={styles.payOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f8fafc' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10, backgroundColor: '#FFF' },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827' },
  content: { padding: 15 },
  darkCard: { backgroundColor: '#111827', borderRadius: 24, padding: 20, marginBottom: 20, borderBottomWidth: 6, borderBottomColor: '#EE6B22' },
  darkCardLabel: { color: '#9CA3AF', fontSize: 10, fontWeight: 'bold' },
  darkCardName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', marginTop: 5 },
  darkCardSub: { color: '#EE6B22', fontSize: 12, fontWeight: 'bold' },
  badgePlaca: { backgroundColor: '#FFF', alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 15 },
  placaText: { color: '#111827', fontWeight: '900', fontSize: 16 },
  section: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginBottom: 15, borderWidth: 1, borderColor: '#f1f5f9' },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#1e293b', marginBottom: 15, textTransform: 'uppercase' },
  label: { fontSize: 11, fontWeight: 'bold', color: '#64748b', marginBottom: 5, textTransform: 'uppercase' },
  input: { backgroundColor: '#f8fafc', borderRadius: 10, padding: 12, marginBottom: 15, borderWidth: 1, borderColor: '#e2e8f0', color: '#1e293b' },
  row: { flexDirection: 'row' },
  rowJustified: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statusBadge: { paddingHorizontal: 15, paddingVertical: 8, borderRadius: 10, alignItems: 'center' },
  statusBadgeText: { color: '#FFF', fontWeight: 'bold', fontSize: 12 },
  partItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  partName: { fontWeight: 'bold', color: '#1e293b' },
  partQty: { fontSize: 10, color: '#94a3b8' },
  partPrice: { fontWeight: '900', color: '#1e293b' },
  photoList: { flexDirection: 'row', marginTop: 10 },
  photoThumb: { width: 100, height: 100, borderRadius: 15, marginRight: 10 },
  emptyText: { fontSize: 12, color: '#94a3b8', fontStyle: 'italic' },
  financeLabel: { fontSize: 13, color: '#64748b', fontWeight: 'bold' },
  financeInput: { backgroundColor: '#f1f5f9', width: 100, padding: 8, borderRadius: 8, textAlign: 'right', fontWeight: 'bold' },
  financeValue: { fontWeight: 'bold', color: '#1e293b' },
  totalBox: { marginTop: 20, paddingTop: 15, borderTopWidth: 2, borderTopColor: '#f1f5f9', borderStyle: 'dashed', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  totalLabel: { fontWeight: '900', color: '#64748b', fontSize: 10 },
  totalAmount: { fontSize: 24, fontWeight: '900', color: '#EE6B22' },
  saveButton: { backgroundColor: '#EE6B22', flexDirection: 'row', height: 60, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  payButton: { backgroundColor: '#16A34A', flexDirection: 'row', height: 60, borderRadius: 15, alignItems: 'center', justifyContent: 'center', marginTop: 10 },
  saveButtonText: { color: 'white', fontWeight: '900', marginLeft: 10, fontSize: 16 },
  smallBtn: { backgroundColor: '#fff7ed', padding: 8, borderRadius: 10 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#FFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 25, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#111827', marginBottom: 20, textAlign: 'center' },
  payOptionBtn: { backgroundColor: '#111827', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center' },
  payOptionText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  payOptionBtnSecondary: { backgroundColor: '#F3F4F6', padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  payOptionTextSecondary: { color: '#111827', fontWeight: 'bold', fontSize: 16 }
});
