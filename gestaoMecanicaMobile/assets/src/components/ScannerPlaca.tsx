import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import api from '../config/api'; 
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function ScannerPlaca({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const cameraRef = useRef<any>(null);

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

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    setLoading(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.5 });
      
      const response = await api.post('/ai/ocr-placa/', { imagem: photo.base64 });
      const placaLimpa = response.data.placa;

      const detailsResponse = await api.get(`/consulta/placa/${placaLimpa}/`);
      const veiculo = detailsResponse.data;

      navigation.replace('NewService', { vehicleData: veiculo });

    } catch (error: any) {
      Alert.alert(
        "Erro na Leitura", 
        error.response?.data?.error || "Não foi possível ler a placa. Tente novamente ou digite manualmente."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        ref={cameraRef}
      />
      
      <TouchableOpacity 
        style={styles.btnPular} 
        onPress={() => navigation.replace('NewService')} 
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
          {loading ? (
            <ActivityIndicator size="large" color="#F97316" />
          ) : (
            <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
              <MaterialCommunityIcons name="camera" size={32} color="white" />
            </TouchableOpacity>
          )}
          <Text style={styles.instruction}>Enquadre a placa e toque na câmera</Text>
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
  instruction: { color: 'white', fontSize: 16, fontWeight: 'bold', marginTop: 15, textAlign: 'center' },
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
  captureButton: {
    width: 70,
    height: 70,
    backgroundColor: '#F97316',
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  }
});