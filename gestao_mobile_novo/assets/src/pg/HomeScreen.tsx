import React, { useState } from 'react';
import { 
    StyleSheet, 
    View, 
    Text, 
    TouchableOpacity, 
    SafeAreaView, 
    StatusBar,
    ScrollView,
    Dimensions,
    TextInput,
    Image
} from 'react-native';
import { 
    Home, 
    Users, 
    Motorbike, 
    HandPlatter, 
    Cog, 
    Car, 
    Clock, 
    CheckCircle2, 
    ChevronRight,
    UserCircle,
    Search // Ícone de busca
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
    const [activeTab, setActiveTab] = useState('home');
    const activeColor = '#F97316'; 

    // Logo (usando a que você já tem ou um placeholder para o print)
    const myLogo = require('../img/logo.png');

    return (
        <SafeAreaView style={styles.background}>
            <StatusBar barStyle="dark-content" backgroundColor="#f5f5f5" />
            
            {/* Header com Logo à Esquerda e Perfil à Direita */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Image source={myLogo} style={styles.miniLogo} />

                </View>
                <TouchableOpacity style={styles.profileBtn}>
                    <UserCircle color="black" size={40} strokeWidth={1.5} />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* BARRA DE PESQUISA LARANJA */}
                <View style={styles.searchContainer}>
                    <Search color="#9CA3AF" size={20} style={styles.searchIcon} />
                    <TextInput 
                        placeholder="Pesquisa" 
                        placeholderTextColor="#9CA3AF" 
                        style={styles.searchInput}
                    />
                </View>

                {/* CARDS DE ALERTA (PEÇAS E SERVIÇOS) */}
                <View style={styles.alertCardsRow}>
                    <View style={styles.alertCard}>
                        <Text style={styles.alertTitle}>Peças com estoque baixo</Text>
                        <Text style={styles.alertValue}>0</Text>
                    </View>
                    <View style={styles.alertCard}>
                        <Text style={styles.alertTitle}>Serviço em andamento</Text>
                        <Text style={styles.alertValue}>0</Text>
                    </View>
                </View>

                <Text style={styles.sectionTitle}>Serviços Recentes</Text>
                
                <TouchableOpacity style={styles.osCard}>
                    <View style={styles.osInfo}>
                        <Text style={styles.carModel}>Fiat Uno - ABC1234</Text>
                        <Text style={styles.clientName}>Cliente: Ruan Silva</Text>
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>EM MANUTENÇÃO</Text>
                        </View>
                    </View>
                    <ChevronRight color="#9CA3AF" size={24} />
                </TouchableOpacity>
            </ScrollView>

            {/* NAVBAR PRETA */}
            <View style={styles.navBarContainer}>
                <View style={styles.navBar}>
                    <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('home')}>
                        <Home color={activeTab === 'home' ? activeColor : 'white'} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('users')}>
                        <Users color={activeTab === 'users' ? activeColor : 'white'} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setActiveTab('Motorbike')}>
                        <Motorbike color={activeTab === 'Motorbike' ? activeColor : 'white'} size={30} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('servicos')}>
                        <HandPlatter color={activeTab === 'servicos' ? activeColor : 'white'} size={24} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.navItem} onPress={() => setActiveTab('config')}>
                        <Cog color={activeTab === 'config' ? activeColor : 'white'} size={24} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: { flex: 1, backgroundColor: '#f5f5f5' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 20, paddingTop: 50 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    miniLogo: { width: 50, height: 50, borderRadius: 25, marginRight: 10 },
    headerTexts: { justifyContent: 'center' },
    welcomeText: { fontSize: 12, color: '#4D7C0F' },
    appName: { fontSize: 18, fontWeight: 'bold', color: '#1A2E05' },
    
    // ESTILO DA PESQUISA
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        borderWidth: 2,
        borderColor: '#F97316', // Laranja
        borderRadius: 12, // Aproximadamente 20% de borda arredondada
        paddingHorizontal: 15,
        marginBottom: 20,
        height: 50,
    },
    searchIcon: { marginRight: 10 },
    searchInput: { flex: 1, color: '#1A2E05', fontSize: 16 },

    // ESTILO DOS CARDS DE ALERTA
    alertCardsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 25 },
    alertCard: {
        backgroundColor: '#FFF',
        width: (width - 50) / 2,
        padding: 15,
        borderRadius: 15,
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
    alertTitle: { fontSize: 13, fontWeight: 'bold', color: '#F97316', marginBottom: 8, textAlign: 'center' },
    alertValue: { fontSize: 22, fontWeight: 'bold', color: '#000', textAlign: 'center' },

    scrollContent: { paddingHorizontal: 20, paddingBottom: 150 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A2E05', marginBottom: 15 },
    osCard: { backgroundColor: '#FFF', borderRadius: 15, padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, borderLeftWidth: 5, borderLeftColor: '#65A30D' },
    osInfo: { flex: 1 },
    carModel: { fontSize: 16, fontWeight: 'bold', color: '#1A2E05' },
    clientName: { fontSize: 14, color: '#6B7280', marginVertical: 4 },
    statusBadge: { backgroundColor: '#FEF9C3', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 5 },
    statusText: { fontSize: 10, fontWeight: 'bold', color: '#854D0E' },

    navBarContainer: { position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center' },
    navBar: {
        flexDirection: 'row',
        backgroundColor: 'black',
        width: width * 0.9,
        height: 70,
        borderRadius: 35,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        elevation: 10,
    },
    navItem: { alignItems: 'center', justifyContent: 'center' },
    addBtn: { width: 60, height: 60, justifyContent: 'center', alignItems: 'center' }
});