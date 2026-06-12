import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Menu, Plus, Search, Package, Camera } from 'lucide-react-native';
import api from '../config/api';

export default function PartScreen({ navigation }: any) {
  const [search, setSearch] = useState('');
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pecas/?page_size=1000');
      const dadosRecuperados = response.data.results || response.data;
      setParts(dadosRecuperados);
    } catch (error) {
      console.error("Erro ao carregar peças:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchParts();
    }, [])
  );

  const filteredParts = Array.isArray(parts) 
    ? parts.filter((part: any) => 
        (part.nome || '').toLowerCase().includes(search.toLowerCase()) ||
        (part.numero_serie || '').toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const semEstoque = Array.isArray(parts) ? parts.filter((p: any) => p.quantidade_em_estoque <= 5).length : 0;

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Peças</Text>
        <View style={{ width: 32 }} />
      </View>

      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
        </View>
      ) : (
        <FlatList
          data={filteredParts}
          keyExtractor={(item: any) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.topActionsContainer}>
              <View style={styles.searchContainer}>
                <Search color="#9CA3AF" size={20} />
                <TextInput 
                  placeholder="Buscar peça ou código..." 
                  style={styles.searchInput}
                  placeholderTextColor="#9CA3AF"
                  value={search}
                  onChangeText={setSearch}
                />
              </View>

              <View style={{ flexDirection: 'row' }}>
                <TouchableOpacity 
                  style={[styles.actionButton, { marginRight: 10, backgroundColor: '#10B981' }]}
                  onPress={() => navigation.navigate('ScannerNf')}
                >
                  <Camera color="white" size={20} />
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.actionButton}
                  onPress={() => navigation.navigate('PartDetails', {})}
                >
                  <Plus color="white" size={24} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.summaryCards}>
              <View style={styles.summaryCard}>
                <Text style={styles.summaryValue}>{parts.length}</Text>
                <Text style={styles.summaryLabel}>Total de Peças</Text>
              </View>
              <View style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color: '#DC2626' }]}>
                  {semEstoque}
                </Text>
                <Text style={styles.summaryLabel}>Estoque Baixo</Text>
              </View>
            </View>
          </>
        }
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.card}
            onPress={() => navigation.navigate('PartDetails', { part: item })}
          >
            <View style={styles.cardIcon}>
              <Package size={32} color="#EE6B22" />
            </View>
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.nome}</Text>
              <View style={styles.row}>
                <Text style={styles.codeText}>Cód: {item.numero_serie || 'N/A'}</Text>
                <Text style={styles.categoryText}>Grupo {item.grupo || 'N/A'}</Text>
              </View>
              <View style={styles.row}>
                <Text style={[styles.stockText, item.quantidade_em_estoque <= 5 && { color: '#DC2626' }]}>
                  Estoque: {item.quantidade_em_estoque} un.
                </Text>
                <Text style={styles.priceText}>
                  R$ {parseFloat(item.preco_venda || 0).toFixed(2).replace('.', ',')}
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
  topActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, marginTop: 10 },
  searchContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 8, paddingHorizontal: 12, height: 44, marginRight: 15, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 10, color: '#111827', fontSize: 14 },
  actionButton: { backgroundColor: '#F97316', width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', elevation: 3 },
  summaryCards: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  summaryCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 8, padding: 15, alignItems: 'center', elevation: 1, marginHorizontal: 5 },
  summaryValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  summaryLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  cardIcon: { marginRight: 15, backgroundColor: '#FFF3ED', padding: 10, borderRadius: 8 },
  cardInfo: { flex: 1 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 },
  codeText: { fontSize: 12, color: '#6B7280' },
  categoryText: { fontSize: 10, backgroundColor: '#E5E7EB', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, overflow: 'hidden' },
  stockText: { fontSize: 14, fontWeight: '600', color: '#16A34A' },
  priceText: { fontSize: 16, fontWeight: 'bold', color: '#111827' }
});
