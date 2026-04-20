import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { RouteProp, useRoute, useNavigation, NavigationProp } from '@react-navigation/native';
import { useCart } from '../components/CartContext'; 

interface Product {
    id: number;
    nome: string;
    preco: string;
    categoria: string;
    descricao: string;
    img: any;
}

type DetalhesRouteParams = {
    Detalhes: {
        produto: Product;
    };
};
type RootStackParamList = { Sacola: undefined; Detalhes: undefined };
type DetalhesScreenNavigationProp = NavigationProp<RootStackParamList>;

type DetalhesRouteProp = RouteProp<DetalhesRouteParams, 'Detalhes'>;

export default function DetalhesScreen() {
    const route = useRoute<DetalhesRouteProp>();
    const navigation = useNavigation<DetalhesScreenNavigationProp>();
    const { addItem } = useCart(); 
    
    const produto = route.params?.produto;
    const [quantidade, setQuantidade] = useState(1);

    const parsePrice = (priceString: string): number => {
        return parseFloat(priceString.replace('R$', '').replace(',', '.').trim()) || 0;
    };

    const handleSetQuantidade = (action: 'increase' | 'decrease') => {
        if (action === 'increase') {
            setQuantidade(prev => prev + 1);
        } else if (action === 'decrease' && quantidade > 1) {
            setQuantidade(prev => prev - 1);
        }
    };


    const handleComprar = () => {
        if (!produto) return;
        addItem(produto, quantidade);

        const totalItem = parsePrice(produto.preco) * quantidade;

        Alert.alert(
            "Adicionado à Sacola", 
            `${quantidade}x ${produto.nome} adicionado(s) com sucesso! Total: R$ ${totalItem.toFixed(2).replace('.', ',')}`,
            [
                { 
                    text: "Ir para a Sacola", 
                    onPress: () => navigation.navigate('Sacola')
                },
                { 
                    text: "Continuar Comprando", 
                    style: 'cancel' 
                }
            ]
        );
        setQuantidade(1);
    };

    if (!produto) {
        return (
            <View style={styles.containerEmpty}>
                <Text style={styles.errorText}>Produto não encontrado. Tente novamente pela Home.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContent} style={styles.background}>
            <View style={styles.imageContainer}>
                <Image source={produto.img} style={styles.image} resizeMode="cover" />
            </View>

            <View style={styles.detailsCard}>
                <Text style={styles.title}>{produto.nome}</Text>
                <Text style={styles.price}>{produto.preco} / Kg</Text> 
                <Text style={styles.sectionTitle}>Descrição do Produto</Text>
                <Text style={styles.description}>{produto.descricao}</Text>

                <View style={styles.divider} />

                <View style={styles.quantityContainer}>
                    <Text style={styles.sectionTitle}>Quantidade:</Text>
                    <View style={styles.quantityControl}>
                        <TouchableOpacity 
                            onPress={() => handleSetQuantidade('decrease')} 
                            style={styles.quantityButton}
                            accessibilityLabel="Diminuir quantidade"
                        >
                            <Icon name="remove-outline" type="ionicon" color="#FFFFFF" size={24} />
                        </TouchableOpacity>
                        
                        <Text style={styles.quantityText}>{quantidade}</Text>
                        
                        <TouchableOpacity 
                            onPress={() => handleSetQuantidade('increase')} 
                            style={styles.quantityButton}
                            accessibilityLabel="Aumentar quantidade"
                        >
                            <Icon name="add-outline" type="ionicon" color="#FFFFFF" size={24} />
                        </TouchableOpacity>
                    </View>
                </View>

                <Button
                    title={`Adicionar ao Carrinho (${produto.preco.replace('R$', '').trim()} x ${quantidade} = R$ ${(parsePrice(produto.preco) * quantidade).toFixed(2).replace('.', ',')})`}
                    buttonStyle={styles.buyButton}
                    titleStyle={styles.buyButtonTitle}
                    onPress={handleComprar}
                    accessibilityRole="button"
                    accessibilityHint={`Adiciona ${quantidade} unidade(s) de ${produto.nome} ao carrinho`}
                />
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    background: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    imageContainer: {
        width: '100%',
        height: 250,
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    image: {
        width: '100%',
        height: '100%',
    },
    detailsCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        marginHorizontal: 15,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
    },
    title: {
        fontSize: 30,
        fontWeight: 'bold',
        color: '#1A2E05',
        marginBottom: 8,
    },
    price: {
        fontSize: 24,
        fontWeight: '600',
        color: '#65A30D',
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A2E05',
        marginTop: 15,
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        color: '#3F3F46',
        lineHeight: 24,
        textAlign: 'justify',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 15,
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 10,
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        backgroundColor: '#65A30D',
        borderRadius: 8,
        padding: 6,
        marginHorizontal: 8,
    },
    quantityText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A2E05',
        minWidth: 30,
        textAlign: 'center',
    },
    buyButton: {
        backgroundColor: '#4D7C0F',
        borderRadius: 10,
        paddingVertical: 15,
        marginTop: 25,
    },
    buyButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    containerEmpty: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0FDF4',
    },
    errorText: {
        fontSize: 18,
        color: '#DC2626',
    }
});