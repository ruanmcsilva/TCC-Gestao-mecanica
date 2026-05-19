import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, ActivityIndicator, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Menu, FileText, Calendar, LayoutDashboard, History, TrendingUp, DollarSign, Wrench, ChevronRight } from 'lucide-react-native';
import { Picker } from '@react-native-picker/picker';
import api from '../config/api';
import { useFocusEffect } from '@react-navigation/native';
export default function ReportScreen({ navigation }: any) {
  const [activeTab, setActiveTab] = useState<'relatorio' | 'dashboard' | 'historico'>('relatorio');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [periodo, setPeriodo] = useState('mes');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [dashData, setDashData] = useState<any>(null);
  const [periodoDash, setPeriodoDash] = useState('mes');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const fetchReport = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/relatorio-financeiro/?mes=${selectedMonth}&ano=${selectedYear}&periodo=${periodo}`);
      setReportData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/dashboard-analitico/?periodo=${periodoDash}`);
      setDashData(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await api.get('/servicos/?status=CONCLUIDO&ordering=-data_fim');
      const data = response.data.results || response.data || [];
      const sorted = [...data].sort((a: any, b: any) => {
        const dateA = new Date(a.data_fim || a.created_at || 0).getTime();
        const dateB = new Date(b.data_fim || b.created_at || 0).getTime();
        return dateB - dateA;
      });
      setHistoryData(sorted);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  useFocusEffect(
    useCallback(() => {
      if (activeTab === 'relatorio') {
        fetchReport();
      } else if (activeTab === 'dashboard') {
        fetchDashboard();
      } else if (activeTab === 'historico') {
        fetchHistory();
      }
    }, [activeTab, periodo, periodoDash])
  );
  const formatCurrency = (val: number) => {
    return val ? val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0,00';
  };
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '---';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };
  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Menu color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Relatórios</Text>
        <View style={{ width: 32 }} />
      </View>
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'relatorio' && styles.activeTab]} onPress={() => setActiveTab('relatorio')}>
          <FileText color={activeTab === 'relatorio' ? 'white' : '#9CA3AF'} size={16} />
          <Text style={[styles.tabText, activeTab === 'relatorio' && styles.activeTabText]}>Relatório</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'dashboard' && styles.activeTab]} onPress={() => setActiveTab('dashboard')}>
          <LayoutDashboard color={activeTab === 'dashboard' ? 'white' : '#9CA3AF'} size={16} />
          <Text style={[styles.tabText, activeTab === 'dashboard' && styles.activeTabText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'historico' && styles.activeTab]} onPress={() => setActiveTab('historico')}>
          <History color={activeTab === 'historico' ? 'white' : '#9CA3AF'} size={16} />
          <Text style={[styles.tabText, activeTab === 'historico' && styles.activeTabText]}>Histórico</Text>
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <ActivityIndicator size="large" color="#EE6B22" />
          <Text style={{ marginTop: 10, color: '#9CA3AF', fontWeight: 'bold' }}>Carregando dados...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          {activeTab === 'relatorio' && (
            <View>
              <View style={styles.filterCard}>
                <Text style={styles.sectionTitle}>Filtro Financeiro</Text>
                <View style={styles.periodoButtons}>
                  {['mes', '6meses', 'ano'].map(p => (
                    <TouchableOpacity 
                      key={p} 
                      style={[styles.periodBtn, periodo === p && styles.periodBtnActive]}
                      onPress={() => setPeriodo(p)}
                    >
                      <Text style={[styles.periodBtnText, periodo === p && styles.periodBtnTextActive]}>
                        {p === 'mes' ? 'Mês' : p === '6meses' ? '6 Meses' : 'Ano'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <View style={styles.row}>
                  {periodo === 'mes' && (
                    <View style={[styles.pickerWrapper, { flex: 1, marginRight: 10 }]}>
                      <Picker selectedValue={selectedMonth} onValueChange={setSelectedMonth} style={styles.picker}>
                        {Array.from({ length: 12 }, (_, i) => (
                          <Picker.Item key={i} label={String(i + 1).padStart(2, '0')} value={i + 1} />
                        ))}
                      </Picker>
                    </View>
                  )}
                  <View style={[styles.pickerWrapper, { flex: 1 }]}>
                    <Picker selectedValue={selectedYear} onValueChange={setSelectedYear} style={styles.picker}>
                      {Array.from({ length: 5 }, (_, i) => {
                        const year = new Date().getFullYear() - i;
                        return <Picker.Item key={year} label={String(year)} value={year} />;
                      })}
                    </Picker>
                  </View>
                </View>
                <TouchableOpacity style={styles.actionBtn} onPress={fetchReport}>
                  <Text style={styles.actionBtnText}>GERAR RELATÓRIO</Text>
                </TouchableOpacity>
              </View>
              {reportData && (
                <View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
                    <Text style={styles.kpiLabel}>Mão de Obra</Text>
                    <Text style={styles.kpiValue}>R$ {formatCurrency(reportData.total_mao_de_obra)}</Text>
                  </View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#EF4444' }]}>
                    <Text style={styles.kpiLabel}>Custo Peças</Text>
                    <Text style={styles.kpiValue}>R$ {formatCurrency(reportData.total_custo_pecas)}</Text>
                  </View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
                    <Text style={styles.kpiLabel}>Lucro Líquido Real</Text>
                    <Text style={[styles.kpiValue, { color: '#10B981' }]}>R$ {formatCurrency(reportData.total_lucro_bruto)}</Text>
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Fluxo de Peças</Text>
                    <View style={styles.fluxoItem}>
                      <Text style={styles.fluxoLabel}>Venda das Peças (Receita)</Text>
                      <Text style={styles.fluxoValor}>R$ {formatCurrency(reportData.total_pecas_receita)}</Text>
                    </View>
                    <View style={styles.fluxoItem}>
                      <Text style={styles.fluxoLabel}>Custo das Peças (Investimento)</Text>
                      <Text style={[styles.fluxoValor, { color: '#EF4444' }]}>- R$ {formatCurrency(reportData.total_custo_pecas)}</Text>
                    </View>
                    <View style={[styles.fluxoItem, { backgroundColor: '#F9FAFB', marginTop: 10, padding: 10, borderRadius: 8 }]}>
                      <Text style={[styles.fluxoLabel, { color: '#EA580C' }]}>Ganho sobre Peças</Text>
                      <Text style={[styles.fluxoValor, { color: '#16A34A' }]}>R$ {formatCurrency(reportData.total_pecas_receita - reportData.total_custo_pecas)}</Text>
                    </View>
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Resumo de Atividade</Text>
                    <View style={styles.resumoRow}>
                      <Text style={styles.resumoCount}>{reportData.servicos_concluidos_count}</Text>
                      <Text style={styles.resumoText}>Ordens de Serviço Concluídas</Text>
                    </View>
                    <Text style={styles.faturamentoText}>Faturamento Bruto: <Text style={styles.faturamentoValor}>R$ {formatCurrency(reportData.total_receita_bruta)}</Text></Text>
                  </View>
                </View>
              )}
            </View>
          )}
          {activeTab === 'dashboard' && (
            <View>
              <View style={styles.periodoButtons}>
                {['dia', 'quinzena', 'mes', 'trimestral', '6meses', 'ano'].map(p => (
                  <TouchableOpacity 
                    key={p} 
                    style={[styles.periodBtn, { paddingHorizontal: 10 }, periodoDash === p && styles.periodBtnActive]}
                    onPress={() => setPeriodoDash(p)}
                  >
                    <Text style={[styles.periodBtnText, { fontSize: 9 }, periodoDash === p && styles.periodBtnTextActive]}>
                      {p}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {dashData && (
                <View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#3B82F6' }]}>
                    <Text style={styles.kpiLabel}>Faturamento Total</Text>
                    <Text style={styles.kpiValue}>R$ {formatCurrency(dashData.kpis.faturamento_total)}</Text>
                  </View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#10B981' }]}>
                    <Text style={styles.kpiLabel}>Lucro Estimado</Text>
                    <Text style={[styles.kpiValue, { color: '#10B981' }]}>R$ {formatCurrency(dashData.kpis.lucro_estimado)}</Text>
                  </View>
                  <View style={[styles.kpiCard, { borderLeftColor: '#F97316' }]}>
                    <Text style={styles.kpiLabel}>Ticket Médio</Text>
                    <Text style={styles.kpiValue}>R$ {formatCurrency(dashData.kpis.ticket_medio)}</Text>
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Evolução do Faturamento</Text>
                    {dashData.timeline.map((item: any, i: number) => (
                      <View key={i} style={styles.linhaTabela}>
                        <Text style={styles.linhaData}>{item.data_rotulo}</Text>
                        <Text style={styles.linhaValor}>R$ {formatCurrency(item.valor_total_calculado)}</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Desempenho por Mecânico</Text>
                    {dashData.funcionarios.map((f: any, i: number) => (
                      <View key={i} style={{ marginBottom: 15 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                          <Text style={styles.barLabel}>{f.responsavel__username}</Text>
                          <Text style={styles.barValue}>R$ {formatCurrency(f.valor_total_calculado)}</Text>
                        </View>
                        <View style={styles.barBackground}>
                          <View style={[styles.barFill, { width: `${Math.min(f.percentual, 100)}%`, backgroundColor: '#F97316' }]} />
                        </View>
                        <Text style={{ fontSize: 10, color: '#9CA3AF', marginTop: 2 }}>{f.qtd_os} OS ({f.percentual}%)</Text>
                      </View>
                    ))}
                  </View>
                  <View style={styles.card}>
                    <Text style={styles.cardTitle}>Métodos de Pagamento</Text>
                    {dashData.pagamentos.map((p: any, i: number) => {
                      const totalGeral = dashData.pagamentos.reduce((acc: number, cur: any) => acc + cur.valor_total_calculado, 0);
                      const percent = totalGeral > 0 ? (p.valor_total_calculado / totalGeral) * 100 : 0;
                      return (
                        <View key={i} style={{ marginBottom: 15 }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                            <Text style={styles.barLabel}>{p.metodo_pagto}</Text>
                            <Text style={styles.barValue}>R$ {formatCurrency(p.valor_total_calculado)}</Text>
                          </View>
                          <View style={styles.barBackground}>
                            <View style={[styles.barFill, { width: `${Math.min(percent, 100)}%`, backgroundColor: '#10B981' }]} />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              )}
            </View>
          )}
          {activeTab === 'historico' && (
            <View>
              <View style={styles.historyHeader}>
                <Text style={styles.cardTitle}>Registro de Saídas Concluídas</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{historyData.length} Registros</Text>
                </View>
              </View>
              {historyData.map((item: any) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={styles.historyCard}
                  onPress={() => navigation.navigate('ServiceDetails', { service: item })}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={styles.historyId}>#{item.id}</Text>
                      <Text style={styles.historyDivider}>|</Text>
                      {item.cliente_nome === "CONSUMIDOR PADRAO" || item.descricao?.includes("BALCÃO") ? (
                        <Text style={[styles.historyClient, { color: '#2563EB' }]}>VENDA BALCÃO</Text>
                      ) : (
                        <Text style={styles.historyClient}>{item.cliente_nome}</Text>
                      )}
                    </View>
                    <ChevronRight color="#D1D5DB" size={20} />
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 }}>
                    <Text style={styles.historyDate}>{formatDate(item.data_fim)}</Text>
                    <Text style={styles.historyMechanic}>{item.responsavel_nome || 'Admin'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
              {historyData.length === 0 && (
                <Text style={{ textAlign: 'center', color: '#9CA3AF', marginTop: 20 }}>Nenhum serviço concluído encontrado.</Text>
              )}
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1, backgroundColor: '#f9fafb' },
  header: { 
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, backgroundColor: '#FFF'
  },
  headerTitle: { fontSize: 20, fontWeight: '900', color: '#111827', textTransform: 'uppercase', fontStyle: 'italic' },
  tabContainer: { flexDirection: 'row', backgroundColor: '#FFF', marginHorizontal: 20, borderRadius: 12, padding: 4, elevation: 2, marginBottom: 20, marginTop: 10 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 8 },
  activeTab: { backgroundColor: '#EE6B22' },
  tabText: { marginLeft: 8, fontSize: 11, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase' },
  activeTabText: { color: '#FFF' },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  filterCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 20, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#111827', marginBottom: 15, textTransform: 'uppercase' },
  cardTitle: { fontSize: 12, fontWeight: '900', color: '#6B7280', textTransform: 'uppercase', marginBottom: 15, letterSpacing: 1 },
  periodoButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 15, backgroundColor: '#F9FAFB', padding: 5, borderRadius: 10 },
  periodBtn: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 8 },
  periodBtnActive: { backgroundColor: '#EE6B22', elevation: 2 },
  periodBtnText: { fontSize: 11, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase' },
  periodBtnTextActive: { color: '#FFF' },
  row: { flexDirection: 'row', marginBottom: 15 },
  pickerWrapper: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, overflow: 'hidden' },
  picker: { height: 50 },
  actionBtn: { backgroundColor: '#EE6B22', padding: 15, borderRadius: 10, alignItems: 'center', elevation: 2 },
  actionBtnText: { color: 'white', fontWeight: '900', fontSize: 13, textTransform: 'uppercase' },
  kpiCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 20, marginBottom: 15, borderLeftWidth: 4, elevation: 1 },
  kpiLabel: { fontSize: 11, fontWeight: '900', color: '#9CA3AF', textTransform: 'uppercase', marginBottom: 5 },
  kpiValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  fluxoItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  fluxoLabel: { fontSize: 12, fontWeight: 'bold', color: '#4B5563', textTransform: 'uppercase' },
  fluxoValor: { fontSize: 14, fontWeight: '900', color: '#111827' },
  resumoRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', padding: 15, borderRadius: 12, marginBottom: 15 },
  resumoCount: { fontSize: 32, fontWeight: '900', color: '#EE6B22', marginRight: 15 },
  resumoText: { flex: 1, fontSize: 11, fontWeight: '900', color: '#6B7280', textTransform: 'uppercase' },
  faturamentoText: { fontSize: 13, fontWeight: '900', color: '#111827', textTransform: 'uppercase' },
  faturamentoValor: { fontSize: 20, marginLeft: 10 },
  linhaTabela: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  linhaData: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },
  linhaValor: { fontSize: 12, fontWeight: '900', color: '#111827' },
  barLabel: { fontSize: 11, fontWeight: 'bold', color: '#4B5563', textTransform: 'uppercase' },
  barValue: { fontSize: 12, fontWeight: '900', color: '#111827' },
  barBackground: { height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 4 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  badge: { backgroundColor: '#FFF3ED', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#EE6B22', fontSize: 10, fontWeight: '900', textTransform: 'uppercase' },
  historyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 10, elevation: 1, borderWidth: 1, borderColor: '#F3F4F6' },
  historyId: { fontSize: 14, fontWeight: '900', color: '#111827', fontStyle: 'italic' },
  historyDivider: { color: '#D1D5DB', marginHorizontal: 8 },
  historyClient: { fontSize: 11, fontWeight: '900', color: '#EE6B22', textTransform: 'uppercase' },
  historyDate: { fontSize: 12, fontWeight: 'bold', color: '#6B7280' },
  historyMechanic: { fontSize: 11, fontWeight: '900', color: '#4B5563', textTransform: 'uppercase' }
});
