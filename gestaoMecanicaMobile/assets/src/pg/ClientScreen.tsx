import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, Plus, Search, UserCircle, Phone, History } from 'lucide-react-native';
import api from '../config/api'; // Importando sua configuração de API

export default function ClientScreen({ navigation }: any) {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/clientes/?page_size=1000');
      const dadosRecuperados = response.data.results || response.data;
      setClientes(dadosRecuperados);
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  const filteredClients = Array.isArray(clientes)
    ? clientes.filter((client: any) =>
      (client.nome || client.name || '').toLowerCase().includes(searchText.toLowerCase())
    )
    : [];

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Clientes</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.topActionsContainer}>
        <View style={styles.searchContainer}>
          <Search color="#9CA3AF" size={20} />
          <TextInput
            placeholder="Buscar clientes..."
            style={styles.searchInput}
            placeholderTextColor="#9CA3AF"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('ClientDetails', {})}
        >
          <Plus color="white" size={24} />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
        </View>
      ) : (
        <FlatList
          data={filteredClients}
          keyExtractor={(item: any) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('ClientDetails', { client: item })}
            >
              <View style={styles.cardIcon}>
                <UserCircle size={40} color="#EE6B22" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.nome || item.name}</Text>
                <View style={styles.cardSubInfo}>
                  <Phone size={14} color="#6B7280" />
                  <Text style={styles.cardPhone}>{item.telefone || item.phone}</Text>
                </View>
                <Text style={styles.cardCpf}>{item.cpf_cnpj}</Text>
              </View>
              <TouchableOpacity
                style={styles.historyBtn}
                onPress={() => navigation.navigate('ClientHistory', { client: item })}
              >
                <History color="#4F46E5" size={24} />
                <Text style={styles.historyBtnText}>Histórico</Text>
              </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  topActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    paddingHorizontal: 15,
    borderRadius: 12,
    height: 50,
    marginRight: 15,
    elevation: 2,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5
  },
  actionButton: {
    backgroundColor: '#EE6B22',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3
  },
  searchInput: { flex: 1, marginLeft: 10, color: '#111827', fontSize: 16 },
  listContent: { paddingHorizontal: 20, paddingBottom: 100 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4
  },
  cardIcon: { marginRight: 15 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 18, fontWeight: 'bold', color: '#111827', marginBottom: 5 },
  cardSubInfo: { flexDirection: 'row', alignItems: 'center' },
  cardPhone: { fontSize: 14, color: '#6B7280', marginLeft: 5 },
  cardCpf: { fontSize: 12, color: '#9CA3AF', fontStyle: 'italic', marginTop: 2 },
  historyBtn: { alignItems: 'center', justifyContent: 'center', padding: 5, borderLeftWidth: 1, borderLeftColor: '#F3F4F6', marginLeft: 10, paddingLeft: 15 },
  historyBtnText: { fontSize: 10, color: '#4F46E5', fontWeight: 'bold', marginTop: 2 }
});