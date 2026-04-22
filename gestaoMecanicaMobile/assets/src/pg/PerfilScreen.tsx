import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, SafeAreaView, ScrollView } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import * as ImagePicker from 'expo-image-picker'; 
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../components/AuthContext';
import { useNavigation, NavigationProp } from '@react-navigation/native'; 


type RootStackParamList = { Login: undefined; Home: undefined; Perfil: undefined };
type PerfilScreenNavigationProp = NavigationProp<RootStackParamList, 'Perfil'>;

export default function PerfilScreen() {
    const { user, signOut } = useAuth(); 
    const navigation = useNavigation<PerfilScreenNavigationProp>(); 
    const [imageUri, setImageUri] = useState<string | null>(null);

    const requestPermissions = async () => {
        const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

        if (!mediaPermission.granted || !cameraPermission.granted) {
            Alert.alert(
                'Permissão Necessária',
                'Precisamos de acesso à sua Galeria e Câmera para alterar a foto do perfil.'
            );
            return false;
        }
        return true;
    };

    const pickImage = async (mode: 'camera' | 'library') => {
        const hasPermission = await requestPermissions();
        if (!hasPermission) return;

        let result: ImagePicker.ImagePickerResult;

        const options: ImagePicker.ImagePickerOptions = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        };

        if (mode === 'library') {
            result = await ImagePicker.launchImageLibraryAsync(options);
        } else {
            result = await ImagePicker.launchCameraAsync(options);
        }

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImageUri(result.assets[0].uri);
            console.log('Nova URI da Imagem:', result.assets[0].uri);
        }
    };
    
    const handleImagePick = () => {
        Alert.alert(
            "Mudar Foto do Perfil",
            "Escolha de onde você deseja selecionar a imagem:",
            [
                { text: "Abrir Galeria", onPress: () => pickImage('library') },
                { text: "Abrir Câmera", onPress: () => pickImage('camera') },
                { text: "Cancelar", style: 'cancel' }
            ]
        );
    };

    
    const handleLogout = async () => {
        try {
            await signOut(); 
            Alert.alert("Sucesso", "Sessão encerrada com sucesso!");
            
            
            navigation.replace('Login'); 
        } catch (error) {
            Alert.alert("Erro", "Não foi possível encerrar a sessão.");
            console.error("Erro ao fazer logout:", error);
        }
    };
    
    const userName = user?.email.split('@')[0] || 'Usuário';
    const userEmail = user?.email || 'E-mail não disponível';
    const userMembroDesde = user?.membroDesde || 'Junho, 2023';
    const placeholderImage = require('../img/fundo.jpeg');

    return (
        <SafeAreaView style={styles.background}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Meu Perfil</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TouchableOpacity onPress={handleImagePick} style={styles.imageContainer}>
                    <Image
                        source={imageUri ? { uri: imageUri } : placeholderImage} 
                        style={styles.profileImage}
                    />
                    <View style={styles.editIcon}>
                        <Ionicons name="camera" size={20} color="#FFFFFF" />
                    </View>
                </TouchableOpacity>
            
                <View style={styles.dataCard}>
                    <Text style={styles.title}>{userName}</Text> 
                    <Text style={styles.tagline}>Membro EcoVerde</Text>
                    
                    <View style={styles.infoRow}>
                        <Icon name="mail" type="ionicon" size={18} color="#4D7C0F" style={styles.infoIcon} />
                        <Text style={styles.text}>{userEmail}</Text> 
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Icon name="calendar-outline" type="ionicon" size={18} color="#4D7C0F" style={styles.infoIcon} />
                        <Text style={styles.text}>Membro desde: {userMembroDesde}</Text> 
                    </View>

                    <Button
                        title="Editar Dados Pessoais"
                        type="outline"
                        buttonStyle={styles.editButtonOutline}
                        titleStyle={styles.editButtonTitle}
                        onPress={() => Alert.alert('Função em desenvolvimento!')}
                    />
                </View>
            
                <Button
                    title="Sair (Logout)"
                    buttonStyle={styles.logoutButton}
                    titleStyle={{ color: '#FFF', fontWeight: '600' }}
                    onPress={handleLogout} // 5. Chamar a nova função handleLogout
                    accessibilityHint="Toca duas vezes para sair da sua conta"
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        paddingTop: 50,
    },
    header: {
        paddingBottom: 20,
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A2E05',
    },
    scrollContent: {
        alignItems: 'center',
        padding: 20,
    },
    imageContainer: {
        marginBottom: 30,
        position: 'relative',
    },
    profileImage: {
        width: 150,
        height: 150,
        borderRadius: 75,
        borderWidth: 4,
        borderColor: '#65A30D',
    },
    editIcon: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: '#4D7C0F',
        borderRadius: 20,
        padding: 8,
        borderWidth: 2,
        borderColor: '#FFFFFF',
    },
    dataCard: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#1A2E05',
        marginBottom: 4,
    },
    tagline: {
        fontSize: 14,
        color: '#65A30D',
        fontWeight: '500',
        marginBottom: 20,
    },
    infoRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        paddingVertical: 4,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
    },
    infoIcon: {
        marginRight: 10,
        paddingTop: 2,
    },
    text: {
        fontSize: 16,
        color: '#3F3F46',
    },
    editButtonOutline: {
        marginTop: 20,
        width: 250,
        borderRadius: 8,
        borderColor: '#65A30D',
        borderWidth: 2,
        backgroundColor: 'transparent',
    },
    editButtonTitle: {
        color: '#65A30D',
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#DC2626',
        paddingHorizontal: 30,
        paddingVertical: 10,
        borderRadius: 8,
        marginTop: 20,
    },
});