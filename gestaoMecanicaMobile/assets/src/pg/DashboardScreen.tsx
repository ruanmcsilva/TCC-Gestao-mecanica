import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DollarSign, Users, Wrench, Bike, ArrowLeft } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../config/api';

export default function DashboardScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Usuário');
  const [faturamentoMes, setFaturamentoMes] = useState(0);
  const [lucroHoje, setLucroHoje] = useState(0);
  const [servicosAtivos, setServicosAtivos] = useState(0);
  const [clientesCount, setClientesCount] = useState(0);
  const [veiculosCount, setVeiculosCount] = useState(0);
  const [agendamentos, setAgendamentos] = useState<any[]>([]);

  const todayStr = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  useFocusEffect(
    useCallback(() => {
      const fetchAll = async () => {
        setLoading(true);
        try {
          const resUser = await api.get('/auth/user/');
          setUserName(resUser.data.first_name || resUser.data.username || 'Usuário');

          const [resDashMes, resDashDia, resServ, resCli, resMotos, resAg] = await Promise.all([
            api.get('/dashboard-analitico/?periodo=mes'),
            api.get('/dashboard-analitico/?periodo=dia'),
            api.get('/dashboard/services-in-progress/'),
            api.get('/clientes/?page_size=1'),
            api.get('/motos/?page_size=1'),
            api.get('/agendamento/')
          ]);

          setFaturamentoMes(resDashMes.data?.kpis?.faturamento_total || 0);
          setLucroHoje(resDashDia.data?.kpis?.lucro_estimado || 0);
          setServicosAtivos(resServ.data?.count || 0);
          setClientesCount(resCli.data?.count || 0);
          setVeiculosCount(resMotos.data?.count || 0);

          const listAg = resAg.data?.results || resAg.data || [];
          const hojeIso = new Date().toISOString().split('T')[0];
          setAgendamentos(listAg.filter((a: any) => a.data === hojeIso));
        } catch (error) {
          console.error(error);
        } finally {
          setLoading(false);
        }
      };
      fetchAll();
    }, [])
  );

  const formatCurrency = (val: number) => {
    return val ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  };

  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ position: 'absolute', left: 20, zIndex: 10 }}>
          <ArrowLeft color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {loading ? (
          <View style={{ marginTop: 50 }}>
            <ActivityIndicator size="large" color="#EE6B22" />
          </View>
        ) : (
          <>
            <View style={styles.greetingContainer}>
              <Text style={styles.greetingText}>Olá, {userName}!</Text>
              <Text style={styles.dateText}>{todayStr.charAt(0).toUpperCase() + todayStr.slice(1)}</Text>
            </View>

            <View style={styles.cardContainer}>
              <View style={[styles.statCard, { backgroundColor: '#EE6B22' }]}>
                <View style={styles.statHeader}>
                  <Text style={styles.statTitleWhite}>Faturamento do Mês</Text>
                  <DollarSign color="#FFF" size={20} />
                </View>
                <Text style={styles.statValueWhite}>R$ {formatCurrency(faturamentoMes)}</Text>
              </View>

              <View style={styles.row}>
                <View style={[styles.statCardHalf, { marginRight: 10 }]}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statTitle}>Serviços Ativos</Text>
                    <Wrench color="#EE6B22" size={20} />
                  </View>
                  <Text style={styles.statValue}>{servicosAtivos}</Text>
                </View>
                <View style={styles.statCardHalf}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statTitle}>Clientes</Text>
                    <Users color="#EE6B22" size={20} />
                  </View>
                  <Text style={styles.statValue}>{clientesCount}</Text>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.statCardHalf, { marginRight: 10 }]}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statTitle}>Veículos</Text>
                    <Bike color="#EE6B22" size={20} />
                  </View>
                  <Text style={styles.statValue}>{veiculosCount}</Text>
                </View>
                <View style={styles.statCardHalf}>
                  <View style={styles.statHeader}>
                    <Text style={styles.statTitle}>Lucro Hoje</Text>
                    <DollarSign color="#16A34A" size={20} />
                  </View>
                  <Text style={[styles.statValue, { color: '#16A34A' }]}>R$ {formatCurrency(lucroHoje)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Próximos Agendamentos</Text>
              {agendamentos.length > 0 ? agendamentos.map((ag: any) => (
                <View key={ag.id} style={styles.agendaItem}>
                  <View style={styles.agendaTime}>
                    <Text style={styles.timeText}>{ag.hora?.slice(0, 5) || '--:--'}</Text>
                  </View>
                  <View style={styles.agendaInfo}>
                    <Text style={styles.agendaClient}>{ag.cliente_nome || 'Cliente'}</Text>
                    <Text style={styles.agendaService}>{ag.moto_modelo} • {ag.moto_placa}</Text>
                  </View>
                </View>
              )) : (
                <Text style={{ color: '#9CA3AF', fontSize: 14 }}>Nenhum agendamento para hoje.</Text>
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 10
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#111827' },
  content: { padding: 20 },
  greetingContainer: { marginBottom: 20 },
  greetingText: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  dateText: { fontSize: 14, color: '#6B7280', marginTop: 4 },
  cardContainer: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  statCard: { borderRadius: 16, padding: 20, elevation: 3, shadowColor: '#EE6B22', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  statCardHalf: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 15, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4 },
  statHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  statTitle: { fontSize: 14, color: '#6B7280', fontWeight: '500' },
  statTitleWhite: { fontSize: 14, color: '#FFF', fontWeight: '600', opacity: 0.9 },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  statValueWhite: { fontSize: 32, fontWeight: 'bold', color: '#FFF' },
  section: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 2, paddingBottom: 100 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15 },
  agendaItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 15, borderLeftWidth: 3, borderLeftColor: '#EE6B22', paddingLeft: 10 },
  agendaTime: { backgroundColor: '#FFF3ED', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginRight: 15 },
  timeText: { color: '#EE6B22', fontWeight: 'bold' },
  agendaInfo: { flex: 1 },
  agendaClient: { fontSize: 14, fontWeight: 'bold', color: '#111827' },
  agendaService: { fontSize: 12, color: '#6B7280', marginTop: 2 }
});