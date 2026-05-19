import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, Image, Alert, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Plus, Camera, Printer, CreditCard, CheckCircle } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';

export default function ServiceDetailsScreen({ route, navigation }: any) {
  // 1. Pegamos o serviço dos parâmetros ou um objeto vazio
  const { service: initialService } = route.params || {};
  
  // 2. Ajuste do Loading: Se não tem ID (Nova OS), não precisa carregar dados do banco
  const [loading, setLoading] = useState(initialService?.id ? true : false);
  const [uploading, setUploading] = useState(false);
  const [service, setService] = useState<any>(initialService || null);
  const [parts, setParts] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  
  // Estados dos campos
  const [description, setDescription] = useState(initialService?.descricao || '');
  const [laborCost, setLaborCost] = useState(initialService?.valor_mao_de_obra?.toString() || '0');
  const [status, setStatus] = useState(initialService?.status || 'PENDENTE');
  const [km, setKm] = useState(initialService?.kilometragem?.toString() || '0');

  const fetchServiceData = async () => {
    // Se não tem ID, apenas paramos o loading e saímos
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
      setParts(partsRes.data.results || []);
      setPhotos(photosRes.data.results || []);
      
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
        // EDIÇÃO (PATCH)
        await api.patch(`/servicos/${service.id}/`, payload);
        Alert.alert("Sucesso", "Ordem de Serviço atualizada!");
      } else {
        // CRIAÇÃO (POST)
        // Nota: Garanta que o backend aceite criação apenas com esses campos ou adicione cliente/moto
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
      const url = `http://192.168.0.123:8000/api/v1/servicos/${service.id}/imprimir_os/`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("Erro", "Não foi possível abrir o link de impressão.");
      }
    } catch (error) {
      Alert.alert("Erro", "Falha ao conectar com o servidor.");
    }
  };

  if (loading) return <ActivityIndicator size="large" color="#EE6B22" style={{ flex: 1 }} />;

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{service?.id ? `OS #${service.id}` : 'Nova OS'}</Text>
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
                    source={{ uri: p.foto.startsWith('http') ? p.foto : `http://192.168.0.123:8000${p.foto}` }} 
                    style={styles.photoThumb} 
                  />
                ))}
                {photos.length === 0 && <Text style={styles.emptyText}>Nenhuma foto anexada.</Text>}
              </ScrollView>
            </View>

            <View style={styles.section}>
              <View style={styles.rowJustified}>
                <Text style={styles.sectionTitle}>Peças Utilizadas</Text>
                <TouchableOpacity style={styles.smallBtn}>
                  <Plus size={16} color="#F97316" />
                </TouchableOpacity>
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
          <TouchableOpacity style={styles.payButton} onPress={() => Alert.alert("Pagamento", "Deseja finalizar e emitir nota?")}>
            <CreditCard color="white" size={20} />
            <Text style={styles.saveButtonText}>FINALIZAR E PAGAR</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
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
  smallBtn: { backgroundColor: '#fff7ed', padding: 8, borderRadius: 10 }
});