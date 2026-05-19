import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Wrench, CheckCircle } from 'lucide-react-native';
import api from '../config/api';

export default function ClientHistoryScreen({ route, navigation }: any) {
  const { client } = route.params || {};
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!client?.id) return;
    
    try {
      setLoading(true);
      // Rota exata do seu Django: /api/v1/clientes/<id>/historico/
      const response = await api.get(`/clientes/${client.id}/historico/`);
      setHistory(response.data);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [client?.id]);

  // Função simples para formatar a data (AAAA-MM-DD para DD/MM/AAAA)
  const formatDate = (dateString: string) => {
    if (!dateString) return '--/--/----';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Histórico de Serviços</Text>
        <View style={{ width: 28 }} />
      </View>

      <View style={styles.clientInfo}>
        <Text style={styles.clientName}>{client?.nome || client?.name || 'Cliente'}</Text>
        <Text style={styles.clientSub}>
          {loading ? 'Carregando...' : `Total de ${history.length} serviços realizados`}
        </Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={true}
          ListEmptyComponent={
            <Text style={{ textAlign: 'center', marginTop: 50, color: '#9CA3AF' }}>
              Nenhum serviço encontrado para este cliente.
            </Text>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.titleRow}>
                  <Wrench color="#EE6B22" size={20} />
                  <Text style={styles.serviceName}>{item.descricao_servico || item.service || 'Serviço'}</Text>
                </View>
                <Text style={styles.servicePrice}>
                   R$ {item.total || item.valor_total || '0,00'}
                </Text>
              </View>

              <View style={styles.divider} />

              <View style={styles.cardBody}>
                <View style={styles.infoCol}>
                  <Text style={styles.label}>Data</Text>
                  <Text style={styles.value}>{formatDate(item.data_conclusao || item.data)}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.label}>Mecânico</Text>
                  <Text style={styles.value}>{item.mecanico_nome || item.mecanico || 'Oficina'}</Text>
                </View>
                <View style={styles.infoCol}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.statusRow}>
                    <CheckCircle color="#16A34A" size={14} />
                    <Text style={styles.statusText}>{item.status || 'Concluído'}</Text>
                  </View>
                </View>
              </View>
            </View>
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
  clientInfo: { paddingHorizontal: 20, paddingBottom: 15 },
  clientName: { fontSize: 18, fontWeight: 'bold', color: '#EE6B22', textTransform: 'uppercase' },
  clientSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  titleRow: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 10 },
  serviceName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginLeft: 10 },
  servicePrice: { fontSize: 16, fontWeight: 'bold', color: '#16A34A' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },
  cardBody: { flexDirection: 'row', justifyContent: 'space-between' },
  infoCol: { alignItems: 'flex-start' },
  label: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  value: { fontSize: 14, fontWeight: 'bold', color: '#4B5563' },
  statusRow: { flexDirection: 'row', alignItems: 'center' },
  statusText: { fontSize: 14, fontWeight: 'bold', color: '#16A34A', marginLeft: 4 }
});