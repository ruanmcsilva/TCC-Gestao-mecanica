import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Plus, Search, Bike } from 'lucide-react-native';
import api from '../config/api';



export default function VehicleScreen({ navigation }: any) {
  const [motos, setMotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  // Função para buscar as motos no Docker
  const fetchMotos = async () => {
    try {
      setLoading(true);
      // Rota baseada no seu router.register(r'motos', MotoViewSet)
      const response = await api.get('/motos/');
      
      // Garante que pega a lista mesmo se houver paginação no Django
      const dadosRecuperados = response.data.results || response.data;
      setMotos(Array.isArray(dadosRecuperados) ? dadosRecuperados : []);
    } catch (error) {
      console.error("Erro ao carregar motos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMotos();
  }, []);

  // Filtro para buscar por modelo ou placa
  const filteredMotos = motos.filter((moto: any) => {
    const termo = searchText.toLowerCase();
    return (
      (moto.modelo || '').toLowerCase().includes(termo) ||
      (moto.placa || '').toLowerCase().includes(termo)
    );
  });

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Motos</Text>
        <View style={{ width: 32 }} />
      </View>

      <FlatList
        data={filteredMotos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.topActionsContainer}>
              <View style={styles.searchContainer}>
                <Search color="#9CA3AF" size={20} />
                <TextInput 
                  placeholder="Buscar pela placa ou modelo..." 
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                  value={searchText}
                  onChangeText={setSearchText}
                />
              </View>

              <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('VehicleDetails', {})}
              >
                <Plus color="white" size={24} />
              </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('VehicleDetails', { vehicle: item })}
          >
            <View style={styles.cardIcon}>
              <Bike size={32} color="#EE6B22" />
            </View>
            <View style={styles.cardInfo}>
              <View style={styles.row}>
                <Text style={styles.plateText}>{item.placa}</Text>
                <Text style={styles.yearText}>{item.ano}</Text>
              </View>
              <Text style={styles.modelText}>{item.modelo}</Text>
              <Text style={styles.clientText}>{item.cliente_nome || item.nome_cliente || item.cliente || 'Não informado'}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
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
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  topActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, height: 44, marginRight: 15, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 10, color: '#111827', fontSize: 14 },
  actionButton: { backgroundColor: '#F97316', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardIcon: { marginRight: 15, backgroundColor: '#FFF3ED', padding: 10, borderRadius: 8 },
  cardInfo: { flex: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  plateText: { fontSize: 16, fontWeight: 'bold', color: '#111827', textTransform: 'uppercase', letterSpacing: 1 },
  yearText: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  modelText: { fontSize: 14, color: '#4B5563', marginBottom: 4 },
  clientText: { fontSize: 12, color: 'black', fontStyle: 'italic' },
});
