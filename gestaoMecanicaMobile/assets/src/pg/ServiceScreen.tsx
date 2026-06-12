import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Plus, Search, Wrench, CheckCircle } from 'lucide-react-native';
import api from '../config/api';

export default function ServiceScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await api.get('/servicos/?exclude_balcao=true&page_size=1000');
      const dadosRecuperados = response.data.results || response.data;
      setServices(dadosRecuperados);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const filteredServices = Array.isArray(services) 
    ? services.filter((service: any) => 
        (service.id?.toString() || '').includes(search) ||
        (service.cliente_nome || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'CONCLUIDO': return styles.statusGreen;
      case 'EM_ANDAMENTO': return styles.statusYellow;
      case 'PENDENTE': return styles.statusBlue;
      case 'CANCELADO': return styles.statusRed;
      default: return styles.statusBlue;
    }
  };

  const formatStatus = (status: string) => {
    switch(status) {
      case 'CONCLUIDO': return 'Concluído';
      case 'EM_ANDAMENTO': return 'Em andamento';
      case 'PENDENTE': return 'Pendente';
      case 'CANCELADO': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Serviços</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
        </View>
      ) : (
        <FlatList
          data={filteredServices}
          keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.topActionsContainer}>
              <View style={styles.searchContainer}>
                <Search color="#9CA3AF" size={20} />
                <TextInput 
                  placeholder="Buscar OS, cliente ou placa..." 
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

           <TouchableOpacity 
                style={styles.actionButton}
                onPress={() => navigation.navigate('NewService')}
              >
                <Plus color="white" size={24} />
            </TouchableOpacity>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('ServiceDetails', { service: item })}
          >
            <View style={styles.cardHeader}>
              <View style={styles.titleRow}>
                <Wrench color="#EE6B22" size={20} />
                <Text style={styles.osNumber}>OS #{item.id}</Text>
              </View>
              <Text style={[styles.statusBadge, getStatusColor(item.status)]}>
                {formatStatus(item.status)}
              </Text>
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.cardBody}>
              <View style={styles.row}>
                <Text style={styles.clientText}>{item.cliente_nome || 'Sem Cliente'}</Text>
                {item.moto && <Text style={styles.plateText}>Moto #{item.moto}</Text>}
              </View>
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={styles.dateText}>Data: {new Date(item.data_inicio).toLocaleDateString('pt-BR')}</Text>
                <Text style={styles.totalText}>
                  R$ {parseFloat(item.valor_total_servico || 0).toFixed(2).replace('.', ',')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
      />
      )}
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
  
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 12, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center' },
  osNumber: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginLeft: 10 },
  statusBadge: { fontSize: 12, fontWeight: 'bold', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  statusGreen: { backgroundColor: '#DCFCE7', color: '#16A34A' },
  statusYellow: { backgroundColor: '#FEF9C3', color: '#CA8A04' },
  statusBlue: { backgroundColor: '#DBEAFE', color: '#1D4ED8' },
  statusRed: { backgroundColor: '#FEE2E2', color: '#DC2626' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
  cardBody: {},
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientText: { fontSize: 16, fontWeight: 'bold', color: '#4B5563' },
  plateText: { fontSize: 14, fontWeight: 'bold', color: '#111827', backgroundColor: '#E5E7EB', paddingHorizontal: 6, borderRadius: 4, overflow: 'hidden' },
  dateText: { fontSize: 14, color: '#6B7280' },
  totalText: { fontSize: 16, fontWeight: 'bold', color: '#16A34A' }
});
