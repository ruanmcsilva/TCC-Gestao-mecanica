import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, View, Text, TextInput, TouchableOpacity, ScrollView, 
  Alert, ActivityIndicator, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Save, Plus, Camera, Trash2, Wrench, User, Bike, Package } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../config/api';

export default function NewServiceScreen({ navigation, route }: any) { // Adicionado route aqui
  const [loading, setLoading] = useState(false);
  const [allParts, setAllParts] = useState<any[]>([]);

  // Estados dos formulários
  const [formData, setFormData] = useState({
    nome: '', 
    cpf_cnpj: '', 
    telefone: '', 
    endereco: '', 
    cep: '',
    marca: '', 
    modelo: '', 
    placa: '', 
    ano: new Date().getFullYear().toString(),
    descricao: '', 
    kilometragem: '', 
    data_inicio: new Date().toISOString().slice(0, 16),
    profissional: '', 
  });

  // --- BLOCO ADICIONADO PARA AUTO-PREENCHIMENTO DO SCANNER ---
  useEffect(() => {
    if (route.params?.vehicleData) {
      const { placa, modelo, marca } = route.params.vehicleData;
      setFormData(prev => ({
        ...prev,
        placa: placa || prev.placa,
        modelo: modelo || prev.modelo,
        marca: marca || prev.marca,
      }));
    }
  }, [route.params?.vehicleData]);
  // ----------------------------------------------------------

  const [selectedParts, setSelectedParts] = useState<{ peca: number; quantidade: number; preco: number; nome: string }[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<any[]>([]);
  const [selectedPartId, setSelectedPartId] = useState<number | ''>('');

  useEffect(() => {
    api.get('/pecas/?page_size=1000').then(res => setAllParts(res.data.results || res.data)).catch(err => console.log(err));
  }, []);

  const handleInputChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCEPBlur = async () => {
    const cep = formData.cep.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await api.get(`/consulta/cep/${cep}/`); 
        const data = response.data;
        if (data) {
          const rua = (data.logradouro || data.street || '').replace(/"/g, '');
          const bairro = (data.bairro || data.neighborhood || '').replace(/"/g, '');
          const cidade = (data.localidade || data.city || '').replace(/"/g, '');
          const uf = (data.uf || data.state || '').replace(/"/g, '');
          const enderecoLimpo = [rua, bairro, cidade].filter(Boolean).join(', ') + (uf ? ` - ${uf}` : '');
          handleInputChange('endereco', enderecoLimpo);
        }
      } catch (err) {
        Alert.alert('Atenção', 'CEP não encontrado.');
      }
    }
  };

  const handleCPFBlur = async () => {
    const cpf = formData.cpf_cnpj.replace(/\D/g, '');
    if (cpf.length === 11) {
      try {
        await api.get(`/consulta/cpf/${cpf}/`);
      } catch (err) {
        console.log('CPF test', err);
      }
    }
  };

  const handleAddPart = () => {
    if (!selectedPartId) return;
    const peca = allParts.find(p => p.id === selectedPartId);
    if (!peca) return;
    
    setSelectedParts([...selectedParts, { 
      peca: peca.id, 
      quantidade: 1, 
      preco: peca.preco_venda, 
      nome: peca.nome 
    }]);
    setSelectedPartId('');
  };

  const removePart = (index: number) => {
    setSelectedParts(selectedParts.filter((_, i) => i !== index));
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
            if (!result.canceled) setSelectedFiles([...selectedFiles, result.assets[0]]);
          }
        },
        {
          text: "Galeria",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              allowsEditing: true,
              quality: 0.7,
            });
            if (!result.canceled) setSelectedFiles([...selectedFiles, result.assets[0]]);
          }
        },
        { text: "Cancelar", style: "cancel" }
      ]
    );
  };

  const handleSaveAll = async () => {
    if (!formData.nome || !formData.telefone || !formData.placa || !formData.marca || !formData.descricao) {
        Alert.alert("Erro", "Preencha os campos obrigatórios (Nome, Telefone, Marca, Placa, Descrição).");
        return;
    }

    setLoading(true);
    try {
      const clientRes = await api.post('/clientes/', {
        nome: formData.nome,
        cpf_cnpj: formData.cpf_cnpj.replace(/\D/g, ''),
        telefone: formData.telefone,
        endereco: formData.endereco,
      });

      const motoRes = await api.post('/motos/', {
        cliente: clientRes.data.id,
        marca: formData.marca,
        modelo: formData.modelo,
        placa: formData.placa.toUpperCase(),
        ano: formData.ano ? parseInt(formData.ano) : new Date().getFullYear()
      });

      const serviceRes = await api.post('/servicos/', {
        cliente: clientRes.data.id,
        moto: motoRes.data.id,
        descricao: formData.descricao,
        kilometragem: formData.kilometragem ? parseInt(formData.kilometragem) : 0,
        data_inicio: formData.data_inicio,
        profissional: formData.profissional,
        status: 'PENDENTE'
      });

      const serviceId = serviceRes.data.id;

      if (selectedParts.length > 0) {
        await Promise.all(selectedParts.map(p => 
          api.post('/itens-servico/', {
            servico: serviceId,
            peca: p.peca,
            quantidade_utilizada: p.quantidade,
            valor_unitario_na_epoca: p.preco
          })
        ));
      }

      if (selectedFiles.length > 0) {
        for (const file of selectedFiles) {
          const photoData = new FormData();
          photoData.append('servico', String(serviceId));
          
          const uriParts = file.uri.split('.');
          const fileType = uriParts[uriParts.length - 1];
          // @ts-ignore
          photoData.append('foto', {
            uri: file.uri,
            name: `os_${serviceId}_photo.${fileType}`,
            type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
          });

          await api.post('/fotos/', photoData, {
              headers: { 'Content-Type': 'multipart/form-data' },
          });
        }
      }

      Alert.alert("Sucesso", "O.S. Integrada gerada com sucesso!");
      navigation.replace('ServiceDetails', { service: serviceRes.data });
    } catch (err: any) {
      console.error(err);
      if (err.response?.data) {
         Alert.alert("Erro na gravação", JSON.stringify(err.response.data));
      } else {
         Alert.alert("Erro", "Erro na gravação. Verifique os dados e a conexão.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ArrowLeft color="black" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Entrada Integrada</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* 1. Cliente */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <User color="#2563EB" size={20} />
            <Text style={[styles.sectionTitle, { color: '#2563EB' }]}>1. Cliente</Text>
          </View>
          <TextInput style={styles.input} placeholder="Nome Completo *" value={formData.nome} onChangeText={(t) => handleInputChange('nome', t)} />
          <TextInput style={styles.input} placeholder="CPF / CNPJ" value={formData.cpf_cnpj} onChangeText={(t) => handleInputChange('cpf_cnpj', t)} onBlur={handleCPFBlur} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Telefone (WhatsApp) *" value={formData.telefone} onChangeText={(t) => handleInputChange('telefone', t)} keyboardType="phone-pad" />
          
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="CEP" value={formData.cep} onChangeText={(t) => handleInputChange('cep', t)} onBlur={handleCEPBlur} keyboardType="numeric" />
            <TextInput style={[styles.input, { flex: 2 }]} placeholder="Endereço" value={formData.endereco} onChangeText={(t) => handleInputChange('endereco', t)} />
          </View>
        </View>

        {/* 2. Veículo */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Bike color="#F97316" size={20} />
            <Text style={[styles.sectionTitle, { color: '#F97316' }]}>2. Veículo</Text>
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1, marginRight: 10 }]} placeholder="Marca *" value={formData.marca} onChangeText={(t) => handleInputChange('marca', t)} />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Modelo *" value={formData.modelo} onChangeText={(t) => handleInputChange('modelo', t)} />
          </View>
          <View style={styles.row}>
            <TextInput style={[styles.input, styles.placaInput, { flex: 1, marginRight: 10 }]} placeholder="PLACA *" value={formData.placa} onChangeText={(t) => handleInputChange('placa', t)} autoCapitalize="characters" />
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="Ano" value={formData.ano} onChangeText={(t) => handleInputChange('ano', t)} keyboardType="numeric" />
          </View>
        </View>

        {/* 3. OS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Wrench color="#16A34A" size={20} />
            <Text style={[styles.sectionTitle, { color: '#16A34A' }]}>3. Ordem de Serviço</Text>
          </View>
          
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={formData.profissional}
              onValueChange={(val) => handleInputChange('profissional', val)}
              style={styles.picker}
            >
              <Picker.Item label="--- Selecione o Profissional ---" value="" />
              <Picker.Item label="Ruan (Mestre)" value="Ruan" />
              <Picker.Item label="João Paulo" value="Joao" />
              <Picker.Item label="Carlos Mecânico" value="Carlos" />
            </Picker>
          </View>

          <View style={styles.row}>
            <TextInput style={[styles.input, { flex: 1 }]} placeholder="KM Atual *" value={formData.kilometragem} onChangeText={(t) => handleInputChange('kilometragem', t)} keyboardType="numeric" />
          </View>
          
          <TextInput 
            style={[styles.input, { height: 80, textAlignVertical: 'top' }]} 
            placeholder="Relato do defeito... *" 
            value={formData.descricao} 
            onChangeText={(t) => handleInputChange('descricao', t)} 
            multiline 
          />
        </View>

        {/* 4. Peças */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Package color="#9333EA" size={20} />
            <Text style={[styles.sectionTitle, { color: '#9333EA' }]}>4. Peças</Text>
          </View>
          
          <View style={styles.row}>
            <View style={[styles.pickerContainer, { flex: 1, marginRight: 10 }]}>
              <Picker
                selectedValue={selectedPartId}
                onValueChange={(val) => setSelectedPartId(val)}
                style={styles.picker}
              >
                <Picker.Item label="Pesquisar peça..." value="" />
                {allParts.map(p => (
                  <Picker.Item key={p.id} label={`${p.nome} - R$ ${p.preco_venda}`} value={p.id} />
                ))}
              </Picker>
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={handleAddPart}>
              <Plus color="white" size={24} />
            </TouchableOpacity>
          </View>

          {selectedParts.map((p, i) => (
            <View key={i} style={styles.partItem}>
              <Text style={styles.partText}>{p.nome} (R$ {p.preco})</Text>
              <TouchableOpacity onPress={() => removePart(i)}>
                <Trash2 color="#EF4444" size={20} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

        {/* 5. Fotos */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Camera color="#DB2777" size={20} />
            <Text style={[styles.sectionTitle, { color: '#DB2777' }]}>5. Fotos da Entrada</Text>
          </View>
          
          <TouchableOpacity style={styles.photoUploadBtn} onPress={handlePickPhoto}>
            <Camera color="#9CA3AF" size={32} />
            <Text style={styles.photoUploadText}>CLIQUE PARA ANEXAR FOTOS</Text>
          </TouchableOpacity>
          <Text style={styles.photoCountText}>{selectedFiles.length} arquivos selecionados</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoList}>
            {selectedFiles.map((f, i) => (
              <Image key={i} source={{ uri: f.uri }} style={styles.photoThumb} />
            ))}
          </ScrollView>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleSaveAll}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              <Save color="white" size={24} />
              <Text style={styles.saveButtonText}>FINALIZAR E GERAR O.S.</Text>
            </>
          )}
        </TouchableOpacity>
        
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', 
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFF' 
  },
  iconBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#111827', textTransform: 'uppercase' },
  content: { padding: 15 },
  
  section: { 
    backgroundColor: '#FFF', borderRadius: 24, padding: 20, marginBottom: 20, 
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5 
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  sectionTitle: { fontSize: 12, fontWeight: '900', marginLeft: 8, textTransform: 'uppercase', letterSpacing: 1 },
  
  input: { 
    backgroundColor: '#f9fafb', borderRadius: 12, padding: 15, marginBottom: 12, 
    borderWidth: 1, borderColor: '#f3f4f6', color: '#111827', fontWeight: 'bold' 
  },
  placaInput: { backgroundColor: '#111827', color: 'white', textAlign: 'center', fontSize: 16 },
  row: { flexDirection: 'row' },
  
  pickerContainer: {
    backgroundColor: '#f9fafb', borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: '#f3f4f6', overflow: 'hidden'
  },
  picker: { height: 50, color: '#111827' },
  
  addBtn: { backgroundColor: '#9333EA', justifyContent: 'center', alignItems: 'center', width: 50, borderRadius: 12, marginBottom: 12 },
  partItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAF5FF', padding: 12, borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#F3E8FF' },
  partText: { fontWeight: 'bold', color: '#7E22CE', fontSize: 12 },

  photoUploadBtn: { 
    borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', borderRadius: 16, 
    height: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f9fafb' 
  },
  photoUploadText: { fontSize: 10, fontWeight: '900', color: '#9CA3AF', marginTop: 8 },
  photoCountText: { textAlign: 'center', fontSize: 10, fontWeight: 'bold', color: '#DB2777', marginTop: 8 },
  photoList: { flexDirection: 'row', marginTop: 10 },
  photoThumb: { width: 60, height: 60, borderRadius: 10, marginRight: 10 },

  saveButton: { 
    backgroundColor: '#F97316', flexDirection: 'row', height: 60, borderRadius: 20, 
    alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 4 
  },
  saveButtonDisabled: { backgroundColor: '#D1D5DB' },
  saveButtonText: { color: 'white', fontWeight: '900', marginLeft: 10, fontSize: 16, letterSpacing: 1 },
});