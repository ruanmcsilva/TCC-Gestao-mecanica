import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, Alert } from 'react-native';
import { Icon, Button } from '@rneui/themed';
import { NavigationProp, useNavigation } from '@react-navigation/native';
import { useCart, CartItem } from '../components/CartContext';


type RootStackParamList = { Home: undefined; Finalizar: undefined; Sacola: undefined };
type SacaloScreenNavigationProp = NavigationProp<RootStackParamList, 'Sacola'>;

const parsePrice = (priceString: string): number => {
    return parseFloat(priceString.replace('R$', '').replace(',', '.').trim()) || 0;
};
interface StyleProps {
    card: object;
    image: object;
    details: object;
    name: object;
    price: object;
    quantityControl: object;
    qtyButton: object;
    quantityText: object;
    removeButton: object;
}

const ItemCard = ({ item, updateQuantity, removeItem, styles }: {
    item: CartItem,
    updateQuantity: (id: number, delta: 1 | -1) => void,
    removeItem: (id: number) => void,
    styles: StyleProps
}) => (
    <View style={styles.card}>
        <Image source={item.img} style={styles.image} resizeMode="cover" />
        <View style={styles.details}>
            <Text style={styles.name} numberOfLines={2}>{item.nome}</Text>
            <Text style={styles.price}>Total: R$ {(parsePrice(item.preco) * item.quantity).toFixed(2).replace('.', ',')}</Text>
        </View>
        <View style={styles.quantityControl}>
            <TouchableOpacity onPress={() => updateQuantity(item.id, -1)} style={styles.qtyButton}>
                <Icon name="remove-outline" type="ionicon" color="#4D7C0F" size={20} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity onPress={() => updateQuantity(item.id, 1)} style={styles.qtyButton}>
                <Icon name="add-outline" type="ionicon" color="#4D7C0F" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => {
                removeItem(item.id);
                Alert.alert("Item Removido", "O produto foi retirado da sua sacola.");
            }} style={styles.removeButton}>
                <Icon name="trash-outline" type="ionicon" color="#DC2626" size={20} />
            </TouchableOpacity>
        </View>
    </View>
);

const FixedTotalBar = ({ subtotal, shipping, total, cartItems, navigation }) => (
    <View style={styles.fixedTotalBar}>
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal:</Text>
            <Text style={styles.totalValue}>R$ {subtotal.replace('.', ',')}</Text>
        </View>
        <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Frete:</Text>
            <Text style={styles.totalValue}>{shipping === '0.00' ? 'GRÁTIS' : `R$ ${shipping.replace('.', ',')}`}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.totalRow}>
            <Text style={styles.totalLabelFinal}>Total:</Text>
            <Text style={styles.totalValueFinal}>R$ {total.replace('.', ',')}</Text>
        </View>
        <Button
            title="Finalizar Compra"
            buttonStyle={styles.checkoutButton}
            titleStyle={styles.checkoutButtonTitle}
            onPress={() => navigation.navigate('Finalizar')}
            disabled={cartItems.length === 0}
        />
    </View>
);

export default function SacaloScreen() {
    const navigation = useNavigation<SacaloScreenNavigationProp>();
    const { cartItems, removeItem, updateQuantity } = useCart(); 

    const { subtotal, shipping, total } = useMemo(() => {
        let currentSubtotal = cartItems.reduce((acc, item) =>
            acc + (parsePrice(item.preco) * item.quantity), 0
        );
        let currentShipping = currentSubtotal < 50 && currentSubtotal > 0 ? 10.00 : 0.00;
        let currentTotal = currentSubtotal + currentShipping;
        return {
            subtotal: currentSubtotal.toFixed(2),
            shipping: currentShipping.toFixed(2),
            total: currentTotal.toFixed(2),
        };
    }, [cartItems]);

    const renderItem = ({ item }: { item: CartItem }) => (
        <ItemCard item={item} updateQuantity={updateQuantity} removeItem={removeItem} styles={styles as StyleProps} />
    );

    return (
        <View style={styles.container}>
            <Text style={styles.headerTitle}>Sua Sacola ({cartItems.length})</Text>
            <FlatList
                data={cartItems}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContent}
                style={styles.productList}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Icon name="shopping-bag" type="font-awesome" size={60} color="#65A30D" />
                        <Text style={styles.emptyText}>Sua sacola está vazia.</Text>
                        <Text style={styles.emptySubText}>Volte para a Home e adicione alguns produtos!</Text>
                        <Button
                            title="Voltar para Compras"
                            type="clear"
                            titleStyle={{ color: '#4D7C0F', fontWeight: 'bold', marginTop: 15 }}
                            onPress={() => navigation.navigate('Home')}
                        />
                    </View>
                }
            />
            <FixedTotalBar
                subtotal={subtotal}
                shipping={shipping}
                total={total}
                cartItems={cartItems}
                navigation={navigation}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
        paddingTop: 40,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A2E05',
        textAlign: 'center',
        marginBottom: 20,
    },
    productList: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 15,
        paddingBottom: 150,
    },
    fixedTotalBar: {
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    totalLabel: {
        fontSize: 16,
        color: '#52525B',
    },
    totalValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#3F3F46',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E7EB',
        marginVertical: 10,
    },
    totalLabelFinal: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A2E05',
    },
    totalValueFinal: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#65A30D',
    },
    checkoutButton: {
        backgroundColor: '#4D7C0F',
        borderRadius: 10,
        paddingVertical: 15,
        marginTop: 10,
    },
    checkoutButtonTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: 300,
        marginTop: 50,
    },
    emptyText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#1A2E05',
        marginTop: 20,
    },
    emptySubText: {
        fontSize: 14,
        color: '#52525B',
        marginTop: 5,
    },
    card: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 15,
        padding: 10,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    image: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 10,
    },
    details: {
        flex: 1,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2E05',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#65A30D',
        fontWeight: 'bold',
    },
    quantityControl: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        minWidth: 100,
    },
    qtyButton: {
        padding: 4,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 4,
    },
    quantityText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A2E05',
        marginHorizontal: 8,
    },
    removeButton: {
        marginLeft: 10,
        padding: 4,
    }
});