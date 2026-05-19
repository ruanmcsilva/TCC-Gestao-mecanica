import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../config/api'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScannerPlaca({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.textCenter}>A Space Motos precisa de acesso à câmera.</Text>
        <TouchableOpacity style={styles.btnPermissao} onPress={requestPermission}>
          <Text style={styles.btnText}>Permitir Câmera</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: any) => {
    setScanned(true);
    setLoading(true);
    
    // Limpa o texto lido para evitar espaços ou quebras de linha
    const placaLimpa = data.trim().toUpperCase();

    try {
      // AJUSTADO: Agora batendo com o path('consulta/...') do seu urls.py
      const response = await api.get(`/consulta/placa/${placaLimpa}/`);
      const veiculo = response.data;

      console.log("Dados recebidos:", veiculo);

      // SUBSTITUÍDO navigate POR replace: Remove a câmera do histórico
      navigation.replace('NewService', { vehicleData: veiculo });

    } catch (error) {
      console.log("Erro na API ou Rota não encontrada, indo para manual...");
      // SUBSTITUÍDO navigate POR replace: Evita voltar para a câmera ao cancelar
      navigation.replace('NewService'); 

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      
      {/* BOTÃO PARA CANCELAR E IR PRO MANUAL */}
      <TouchableOpacity 
        style={styles.btnPular} 
        onPress={() => navigation.replace('NewService')} // Ajustado para replace também
      >
        <Text style={styles.btnTextPular}>Cancelar e fazer manual</Text>
        <MaterialCommunityIcons name="close-circle" size={24} color="white" />
      </TouchableOpacity>

      <View style={styles.overlay}>
        <View style={styles.unfocused} />
        <View style={styles.middleRow}>
          <View style={styles.unfocused} />
          <View style={styles.focusedBox} />
          <View style={styles.unfocused} />
        </View>
        <View style={styles.unfocused}>
          {loading && <ActivityIndicator size="large" color="#F97316" />}
          <Text style={styles.instruction}>Aponte para o QR Code da placa</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: 'black', justifyContent: 'center' },
  textCenter: { color: 'white', textAlign: 'center', marginBottom: 20 },
  btnPermissao: { backgroundColor: '#F97316', padding: 15, borderRadius: 10, alignSelf: 'center' },
  btnText: { color: 'white', fontWeight: 'bold' },
  overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  unfocused: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', alignItems: 'center' },
  middleRow: { flexDirection: 'row', height: 250 },
  focusedBox: { flex: 4, borderWidth: 2, borderColor: '#F97316', borderRadius: 15 },
  instruction: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 15 },
  btnPular: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    zIndex: 999,
    elevation: 5,
  },
  btnTextPular: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginRight: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
});