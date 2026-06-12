import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { LogOut, User, Settings, FileText, Calendar, LayoutDashboard } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';

export default function CustomDrawer(props: any) {
  const navigation = useNavigation<any>();
  const { isAdmin, user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }} edges={['top', 'bottom']}>
      <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 2, marginLeft: -12}}>
        
        <View style={styles.header}>
          <View>
            <Text style={styles.userName}>{user ? user.first_name || user.username : 'Carregando...'}</Text>
            <Text style={styles.userRole}>{isAdmin ? 'Administrador' : 'Funcionário'}</Text>
          </View>
        </View>

        <View style={styles.drawerList}>
            <DrawerItemList {...props} />
            
            <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('Profile')}>
              <User color="#EE6B22" size={22} />
              <Text style={styles.drawerItemText}>Perfil</Text>
            </TouchableOpacity>

            {isAdmin && (
              <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('Dashboard')}>
                <LayoutDashboard color="#EE6B22" size={22} />
                <Text style={styles.drawerItemText}>Painel de Controle</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('Schedules')}>
              <Calendar color="#EE6B22" size={22} />
              <Text style={styles.drawerItemText}>Agendamentos</Text>
            </TouchableOpacity>


            <TouchableOpacity style={styles.drawerItem} onPress={() => navigation.navigate('Settings')}>
              <Settings color="#EE6B22" size={22} />
              <Text style={styles.drawerItemText}>Configurações</Text>
            </TouchableOpacity>
        </View>

      </DrawerContentScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut color="#E33E33" size={22} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    padding: 20,
    backgroundColor: '#1E1E1E',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomRightRadius: 20,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 15,
  },
  userName: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  userRole: {
    color: '#EE6B22',
    fontSize: 14,
  },
  drawerList: {
    flex: 1,
    paddingHorizontal: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
  },
  drawerItemText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 15,
    fontSize: 16,
    color: '#E33E33',
    fontWeight: 'bold',
  }
});
