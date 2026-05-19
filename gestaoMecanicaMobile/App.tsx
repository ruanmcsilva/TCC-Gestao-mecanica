import "react-native-gesture-handler";
import React, { useState } from "react"; 
// ADICIONADO StyleSheet AQUI NO IMPORT
import { View, TouchableOpacity, Modal, Text, StyleSheet } from "react-native";
import { NavigationContainer, useNavigationContainerRef } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import ClienteIcon from './assets/src/icons/users.svg';

import {
  MaterialCommunityIcons,
  FontAwesome5
} from '@expo/vector-icons';

// Telas
import LoginScreen from "./assets/src/pg/LoginScreen";
import HomeScreen from "./assets/src/pg/HomeScreen";
import ClientScreen from "./assets/src/pg/ClientScreen";
import ClientDetailsScreen from "./assets/src/pg/ClientDetailsScreen";
import ClientHistoryScreen from "./assets/src/pg/ClientHistoryScreen";
import VehicleScreen from "./assets/src/pg/VehicleScreen";
import VehicleDetailsScreen from "./assets/src/pg/VehicleDetailsScreen";
import ServiceScreen from "./assets/src/pg/ServiceScreen";
import ServiceDetailsScreen from "./assets/src/pg/ServiceDetailsScreen";
import ReportScreen from "./assets/src/pg/ReportScreen";
import SettingsScreen from "./assets/src/pg/SettingsScreen";
import DashboardScreen from "./assets/src/pg/DashboardScreen";
import PartScreen from "./assets/src/pg/PartScreen";
import PartDetailsScreen from "./assets/src/pg/PartDetailsScreen";
import ScheduleScreen from "./assets/src/pg/ScheduleScreen";
import ProfileScreen from "./assets/src/pg/ProfileScreen";
import NewServiceScreen from "./assets/src/pg/NewServiceScreen";
import CustomDrawer from "./assets/src/components/CustomDrawer";
import CadastroTokenScreen from "./assets/src/pg/CadastroTokenScreen";
import AIChatScreen from "./assets/src/components/AIChatScreen";
import ScannerPlaca from "./assets/src/components/ScannerPlaca";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

// 1. BARRA DE NAVEGAÇÃO INFERIOR
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
          tabBarStyle: {
            position: 'absolute',
            bottom: 40,
            left: '5%',
            width: '90%',
            backgroundColor: 'black',
            borderRadius: 35,
            height: 55,
            elevation: 10,
            borderTopWidth: 0,
            marginLeft:20, /*Esta fixo*/
            paddingBottom: 0,
            paddingTop: 7,
            paddingHorizontal: 15,
          },
      }}
    >
      <Tab.Screen name="MainHome" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => (<MaterialCommunityIcons name="home" color={focused ? '#F97316' : 'white'} size={28} />) }} />
      <Tab.Screen name="MainClients" component={ClientScreen} options={{ tabBarIcon: ({ focused }) => (<FontAwesome5 name="users" color={focused ? '#F97316' : 'white'} size={22} />) }} />
      <Tab.Screen name="MainMotos" component={VehicleScreen} options={{ tabBarIcon: ({ focused }) => (<View style={{ marginBottom: 5 }}><MaterialCommunityIcons name="motorbike" color={focused ? '#F97316' : 'white'} size={38} /></View>) }} />
      <Tab.Screen name="MainServices" component={ServiceScreen} options={{ tabBarIcon: ({ focused }) => (<MaterialCommunityIcons name="tools" color={focused ? '#F97316' : 'white'} size={26} />) }} />
      <Tab.Screen name="MainParts" component={PartScreen} options={{ tabBarIcon: ({ focused }) => (<MaterialCommunityIcons name="package-variant-closed" color={focused ? '#F97316' : 'white'} size={26} />) }} />
    </Tab.Navigator>
  );
}

// 2. MENU LATERAL
function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveTintColor: '#F97316',
        drawerStyle: { backgroundColor: '#f5f5f5', width: 280 },
      }}
    >
      <Drawer.Screen name="DashboardRoot" component={TabNavigator} options={{ title: 'Início', drawerIcon: ({ color }) => <MaterialCommunityIcons name="home" color={color} size={22} /> }} />
      <Drawer.Screen name="Reports" component={ReportScreen} options={{ title: 'Relatórios', drawerIcon: ({ color }) => <MaterialCommunityIcons name="chart-bar" color={color} size={22} /> }} />
    </Drawer.Navigator>
  );
}

export default function App() {
  const [chatVisible, setChatVisible] = useState(false);
  const [routeName, setRouteName] = useState("Login");
  const [userToken, setUserToken] = useState<string | null>(null); // Estado que armazena o token
  const navigationRef = useNavigationContainerRef();

  const showChat = routeName !== "Login" && routeName !== "CadastroToken";

  return (
    <SafeAreaProvider>
      <NavigationContainer 
        ref={navigationRef}
        onStateChange={() => {
          const route = navigationRef.getCurrentRoute();
          if (route) setRouteName(route.name);
        }}
      >
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" options={{ headerShown: false }}>
            {(props) => (
              <LoginScreen 
                {...props} 
                onLoginSuccess={(tokenRecebido: string) => {
                  console.log("Token capturado no App:", tokenRecebido);
                  setUserToken(tokenRecebido); 
                }} 
              />
            )}
          </Stack.Screen>

          <Stack.Screen name="AppHome" component={DrawerNavigator} options={{ headerShown: false }} />
          
          {/* ADICIONADO AQUI: Tela de Scanner de Placa */}
          <Stack.Screen 
            name="ScannerPlaca" 
            component={ScannerPlaca} 
            options={{ 
              headerShown: true, 
              title: 'Escanear Placa', 
              headerTintColor: '#F97316', 
              headerStyle: { backgroundColor: '#1a1a1a' } 
            }} 
          />

          <Stack.Screen name="ClientDetails" component={ClientDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ClientHistory" component={ClientHistoryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Dashboard" component={DashboardScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Schedules" component={ScheduleScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="PartDetails" component={PartDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="VehicleDetails" component={VehicleDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="ServiceDetails" component={ServiceDetailsScreen} options={{ headerShown: false }} />
          <Stack.Screen name="NewService" component={NewServiceScreen} options={{ headerShown: false }} />
          <Stack.Screen name="CadastroToken" component={CadastroTokenScreen} options={{ headerShown: false }} />
        </Stack.Navigator>

        {showChat && (
          <>
            <TouchableOpacity 
              style={styles.fab} 
              onPress={() => setChatVisible(true)}
            >
              <MaterialCommunityIcons name="robot" color="white" size={35} />
            </TouchableOpacity>

            <Modal visible={chatVisible} animationType="slide" transparent={false}>
              <View style={{ flex: 1, backgroundColor: '#1a1a1a' }}>
                <View style={styles.headerIA}>
                  <View>
                    <Text style={styles.headerTitle}>Space Expert</Text>
                    <Text style={styles.headerSubtitle}>IA DE MECÂNICA</Text>
                  </View>
                  <TouchableOpacity onPress={() => setChatVisible(false)}>
                    <MaterialCommunityIcons name="chevron-down" color="white" size={30} />
                  </TouchableOpacity>
                </View>
                <AIChatScreen route={{ params: { token: userToken } }} /> 
              </View>
            </Modal>
          </>
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 110, 
    backgroundColor: '#F97316', 
    width: 65, 
    height: 65, 
    borderRadius: 32.5, 
    justifyContent: 'center', 
    alignItems: 'center', 
    elevation: 8, 
    zIndex: 9999 
  },
  headerIA: { 
    paddingTop: 50, 
    paddingBottom: 20, 
    paddingHorizontal: 20, 
    borderBottomWidth: 3, 
    borderBottomColor: '#F97316', 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center' 
  },
  headerTitle: { 
    color: 'white', 
    fontSize: 22, 
    fontWeight: 'bold' 
  },
  headerSubtitle: { 
    color: '#F97316', 
    fontSize: 13, 
    fontWeight: '600', 
    letterSpacing: 1 
  }
});