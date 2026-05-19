import React, { useState, useEffect, useCallback } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    SafeAreaView, 
    StatusBar,
    ScrollView,
    RefreshControl,
    ActivityIndicator
} from 'react-native';
import { 
    Menu,
    Wrench,
    PlayCircle,
    AlertTriangle,
    Layers,
    PlusCircle
} from 'lucide-react-native';
import api from '../config/api';

export default function HomeScreen({ navigation }: any) {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    
    // Estados para os contadores do Dashboard
    const [stats, setStats] = useState({
        emAndamento: 0,
        estoqueBaixo: 0,
        totalItens: 0
    });

const fetchDashboardData = useCallback(async () => {
    try {
        // Usamos o parâmetro 'pagination=false' ou um limite muito alto.
        // A maioria das APIs Django configuradas com rest_framework aceita o limite.
        const [servicosRes, pecasRes] = await Promise.all([
            api.get('/servicos/?page_size=1000&exclude_balcao=true'), 
            api.get('/pecas/?page_size=1000')
        ]);

        // Verificamos se os dados vieram dentro de 'results' ou direto no array
        const servicos = Array.isArray(servicosRes.data) ? servicosRes.data : servicosRes.data.results || [];
        const pecas = Array.isArray(pecasRes.data) ? pecasRes.data : pecasRes.data.results || [];

        // Filtro para "Em Andamento" ignorando maiúsculas/minúsculas
        const emAndamento = servicos.filter((s: any) => {
            const status = s.status ? s.status.toLowerCase() : '';
            return status === 'em_andamento' || status === 'andamento';
        }).length;

        // Filtro de estoque baixo (menor ou igual a 5 unidades)
        const estoqueBaixo = pecas.filter((p: any) => p.quantidade_em_estoque <= 5).length;
        
        // Total de itens agora deve mostrar os 12 (ou quantos tiverem no banco)
        const totalItens = pecas.length; 

        setStats({
            emAndamento,
            estoqueBaixo,
            totalItens
        });
    } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
    } finally {
        setLoading(false);
        setRefreshing(false);
    }
}, []);

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const onRefresh = () => {
        setRefreshing(true);
        fetchDashboardData();
    };

    return (
        <SafeAreaView style={styles.background}>
            <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
            
            <View style={styles.header}>
                <TouchableOpacity style={styles.menuBtn} onPress={() => navigation.openDrawer()}>
                    <Menu color="black" size={32} strokeWidth={1.5} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>DASHBOARD</Text>
                <View style={{ width: 32 }} />
            </View>

            <ScrollView 
                contentContainerStyle={styles.scrollContent} 
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} color="#F97316" />
                }
            >
                
                {loading && !refreshing ? (
                    <ActivityIndicator size="large" color="#F97316" style={{ marginTop: 20 }} />
                ) : (
                    <>
                        {/* CARDS DE STATUS */}
                        <View style={styles.statusCardsContainer}>
                            
                            {/* Em Andamento */}
                            <View style={[styles.statusCard, { borderLeftColor: '#F97316' }]}>
                                <View style={styles.statusHeader}>
                                    <PlayCircle size={18} color="#F97316" />
                                    <Text style={styles.statusTitle}>EM ANDAMENTO</Text>
                                </View>
                                <Text style={styles.statusValue}>{stats.emAndamento}</Text>
                            </View>

                            {/* Estoque Baixo */}
                            <View style={[styles.statusCard, { borderLeftColor: '#EF4444' }]}>
                                <View style={styles.statusHeader}>
                                    <AlertTriangle size={18} color={stats.estoqueBaixo > 0 ? '#EF4444' : '#D1D5DB'} />
                                    <Text style={styles.statusTitle}>ESTOQUE CRÍTICO</Text>
                                </View>
                                <Text style={[styles.statusValue, { color: stats.estoqueBaixo > 0 ? '#EF4444' : '#111827' }]}>
                                    {stats.estoqueBaixo}
                                </Text>
                            </View>

                            {/* Total de Itens */}
                            <View style={[styles.statusCard, { borderLeftColor: '#2563EB' }]}>
                                <View style={styles.statusHeader}>
                                    <Layers size={18} color="#2563EB" />
                                    <Text style={styles.statusTitle}>TOTAL DE ITENS</Text>
                                </View>
                                <Text style={[styles.statusValue, { color: '#1D4ED8' }]}>{stats.totalItens}</Text>
                            </View>

                        </View>

                        {/* AÇÕES PRINCIPAIS */}
                       <View style={styles.actionsContainer}>
                        {/* NOVA O.S. - Agora aponta direto para o Scanner primeiro */}
                        <TouchableOpacity
                            style={styles.actionCard} 
                            onPress={() => navigation.navigate('ScannerPlaca')} // Único caminho: Scanner
                        >
                            <View style={[styles.iconContainer, { backgroundColor: '#F97316' }]}>
                                <Wrench size={28} color="white" />
                            </View>
                            <Text style={styles.actionTitle}>Nova O.S.</Text>
                            <Text style={styles.actionDesc}>Iniciar serviço via QR Code ou manual.</Text>
                            
                            <View style={styles.actionFooter}>
                                <PlusCircle size={16} color="#EA580C" />
                                <Text style={[styles.actionFooterText, { color: '#EA580C' }]}>COMEÇAR AGORA</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    </>
                )}
                
                <Text style={styles.footerText}>SISTEMA SPACE MOTOS v1.0</Text>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: '#f9fafb' },
    header: { 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 20, 
        paddingTop: 20, 
        paddingBottom: 10 
    },
    headerTitle: { fontSize: 14, fontWeight: '900', color: '#111827', letterSpacing: 2 },
    menuBtn: { padding: 5 },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 100 },

    statusCardsContainer: { marginBottom: 25 },
    statusCard: {
        backgroundColor: '#FFF',
        padding: 15,
        borderRadius: 12,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 5,
        borderLeftWidth: 4,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    statusHeader: { flexDirection: 'row', alignItems: 'center' },
    statusTitle: { fontSize: 10, fontWeight: '900', color: '#6B7280', marginLeft: 10, letterSpacing: 1 },
    statusValue: { fontSize: 24, fontWeight: '900', color: '#111827' },

    actionsContainer: { marginBottom: 20 },
    actionCard: {
        backgroundColor: '#FFF',
        padding: 25,
        borderRadius: 24,
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        borderWidth: 1,
        borderColor: '#F3F4F6'
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    actionTitle: { fontSize: 24, fontWeight: '900', color: '#111827', textTransform: 'uppercase', letterSpacing: -0.5, marginBottom: 8 },
    actionDesc: { fontSize: 14, color: '#6B7280', fontWeight: '500', marginBottom: 25, lineHeight: 20 },
    actionFooter: { flexDirection: 'row', alignItems: 'center' },
    actionFooterText: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginLeft: 5 },
    footerText: { textAlign: 'center', fontSize: 10, fontWeight: '900', color: '#D1D5DB', letterSpacing: 3, marginTop: 20 },


});