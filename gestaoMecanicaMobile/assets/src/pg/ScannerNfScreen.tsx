import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Camera as CameraIcon, Check, X, Zap, ZapOff } from 'lucide-react-native';
import api from '../config/api';

export default function ScannerNfScreen({ navigation }: any) {
  const [permission, requestPermission] = useCameraPermissions();
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [flash, setFlash] = useState<'on' | 'off'>('off');
  const cameraRef = useRef<CameraView>(null);

  if (!permission) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#EE6B22" /></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>Precisamos da sua permissão para usar a câmera</Text>
        <TouchableOpacity style={styles.captureBtn} onPress={requestPermission}>
          <Text style={{ color: 'white' }}>Conceder Permissão</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current) {
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.8,
          base64: true,
        });
        setPhotoUri(photo?.uri || null);
        setPhotoBase64(photo?.base64 || null);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível capturar a imagem.');
      }
    }
  };

  const uploadInvoice = async () => {
    if (!photoBase64) return;
    setLoading(true);
    try {
      await api.post('/pecas/upload-nf/', { imagem: photoBase64 });
      Alert.alert(
        'Sucesso!',
        'Nota fiscal processada. Acesse o computador (painel web) para confirmar os preços e salvar as peças.',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert('Erro', err.response?.data?.error || 'Erro ao processar imagem.');
    } finally {
      setLoading(false);
    }
  };

  const toggleFlash = () => {
    setFlash(prev => prev === 'off' ? 'on' : 'off');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft color="white" size={28} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ler Nota Fiscal</Text>
        <TouchableOpacity onPress={toggleFlash}>
          {flash === 'on' ? <Zap color="#EE6B22" size={24} /> : <ZapOff color="white" size={24} />}
        </TouchableOpacity>
      </View>

      {photoUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: photoUri }} style={styles.previewImage} resizeMode="contain" />
          <View style={styles.previewActions}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#EF4444' }]} onPress={() => { setPhotoUri(null); setPhotoBase64(null); }} disabled={loading}>
              <X color="white" size={30} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#10B981' }]} onPress={uploadInvoice} disabled={loading}>
              {loading ? <ActivityIndicator color="white" /> : <Check color="white" size={30} />}
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <CameraView style={styles.camera} facing="back" enableTorch={flash === 'on'} ref={cameraRef}>
          <View style={styles.cameraOverlay}>
            <View style={styles.focusFrame} />
            <Text style={styles.instructionText}>Alinhe a nota fiscal dentro da área</Text>
          </View>
          <View style={styles.cameraActions}>
            <TouchableOpacity style={styles.captureBtnInner} onPress={takePicture}>
              <CameraIcon color="white" size={35} />
            </TouchableOpacity>
          </View>
        </CameraView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 15, zIndex: 10 },
  headerTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  camera: { flex: 1 },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)' },
  focusFrame: { width: '85%', height: '60%', borderWidth: 2, borderColor: '#EE6B22', borderRadius: 10, backgroundColor: 'transparent' },
  instructionText: { color: 'white', marginTop: 20, fontSize: 16, fontWeight: '500' },
  cameraActions: { paddingBottom: 40, alignItems: 'center', backgroundColor: 'transparent' },
  captureBtn: { backgroundColor: '#EE6B22', padding: 15, borderRadius: 10 },
  captureBtnInner: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#EE6B22', justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#FFF' },
  previewContainer: { flex: 1, backgroundColor: '#000' },
  previewImage: { flex: 1 },
  previewActions: { flexDirection: 'row', justifyContent: 'space-evenly', paddingVertical: 30 },
  actionBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
});
