import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import api from '../config/api';

export default function ProfileScreen({ navigation }: any) {
  const [userData, setUserData] = useState({ first_name: '', email: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/user/');
        setUserData({
          first_name: response.data.first_name || response.data.username || 'Usuário',
          email: response.data.email || 'Nenhum e-mail cadastrado',
        });
      } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        Alert.alert("Erro", "Não foi possível carregar as informações do perfil.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={[styles.background, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EE6B22" />
      </SafeAreaView>
    );
  }

  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.first_name)}&background=EE6B22&color=fff&size=128`;

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
          source={{ uri: avatarUrl }} 
          style={styles.avatar} 
        />
        <Text style={styles.name}>{userData.first_name}</Text>
        <Text style={styles.role}>Colaborador(a)</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Email</Text>
          <Text style={styles.value}>{userData.email}</Text>
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
  name: { fontSize: 24, fontWeight: 'bold', color: '#111827', textAlign: 'center' },
  role: { fontSize: 16, color: '#EE6B22', marginBottom: 30 },
  card: {
    backgroundColor: '#FFF', width: '100%', borderRadius: 12, padding: 20,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4
  },
  label: { fontSize: 14, color: '#6B7280', marginBottom: 5 },
  value: { fontSize: 16, fontWeight: 'bold', color: '#111827', marginBottom: 15 }
});
