import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";


import { AuthProvider } from "./assets/src/components/AuthContext";
// 🎯 Correção na importação
import { CartProvider } from "./assets/src/components/CartContext"; 

import LoginScreen from "./assets/src/pg/LoginScreen";
import CadastroScreen from "./assets/src/pg/CadastroScreen";
import HomeScreen from "./assets/src/pg/HomeScreen";
import DetalhesScreen from './assets/src/pg/DetalhesScreen'; 
import PerfilScreen from "./assets/src/pg/PerfilScreen";
import SacaloScreen from "./assets/src/pg/SacaloScreen";
import FinalizarScreen from "./assets/src/pg/FinalizarScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <CartProvider> 
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Cadastro" component={CadastroScreen} options={{ headerShown: false }} />
            <Stack.Screen name="Home" component={HomeScreen} options= {{ headerShown: false }} />
            <Stack.Screen name="Detalhes" component={DetalhesScreen} options= {{ headerShown: false }} />
            <Stack.Screen name="Perfil" component={ PerfilScreen } options= {{ headerShown: false }} />
            <Stack.Screen name="Sacola" component={ SacaloScreen} options= {{ headerShown: false }} />
            <Stack.Screen name="Finalizar" component={ FinalizarScreen } options= {{ headerShown: false }} />
          </Stack.Navigator>
        </NavigationContainer>
      </CartProvider>
    </AuthProvider> 
  );
}