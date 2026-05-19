import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';

export default function ProfileScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.background}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="black" size={32} strokeWidth={1.5} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Meu Perfil</Text>
        <View style={{ width: 32 }} />
      </View>

      <View style={styles.content}>
        <Image 
          source={{ uri: 'https://ui-avatars.com/api/?name=João+Silva&background=EE6B22&color=fff&size=128' }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>João Silva</Text>
        <Text style={styles.role}>Mecânico Chefe</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>joao.silva@oficina.com.br</Text>
          
          <Text style={styles.label}>Telefone</Text>
          <Text style={styles.value}>(11) 98888-7777</Text>
        </View>
      </View>
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
  content: { padding: 20, alignItems: 'center' },
  avatar: { width: 120, height: 120, borderRadius: 60, marginBottom: 20 },
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  role: { fontSize: 16, color: '#EE6B22', marginBottom: 30 },
  card: {
    backgroundColor: '#FFF', width: '100%', borderRadius: 12, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4
  },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15 }
});
