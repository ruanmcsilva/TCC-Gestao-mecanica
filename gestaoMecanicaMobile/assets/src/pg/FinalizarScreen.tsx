import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Button, Icon } from '@rneui/themed';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native';

const mockTotal = {
    subtotal: '108,50',
    shipping: '0,00',
    total: '108,50',
};

const mockAddress = {
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Jardim Novo',
    cidade: 'São Paulo',
    cep: '01000-000',
};

const paymentMethods = [
    { key: 'pix', label: 'Pix', icon: 'qr-code-outline' },
    { key: 'card', label: 'Cartão de Crédito', icon: 'card-outline' },
    { key: 'boleto', label: 'Boleto Bancário', icon: 'document-text-outline' },
];

export default function FinalizarScreen() {
    const navigation = useNavigation<NavigationProp<any>>();
    const [selectedPayment, setSelectedPayment] = useState(paymentMethods[0].key);
    
    const handlePlaceOrder = () => {
        Alert.alert(
            "Pedido Finalizado!", 
            `Seu pedido no valor de R$ ${mockTotal.total} foi confirmado. Método de Pagamento: ${paymentMethods.find(p => p.key === selectedPayment)?.label}.`,
            [{ text: "Voltar para Home", onPress: () => navigation.navigate('Home') }]
        );
    };

    const AddressSection = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Endereço de Entrega</Text>
            <View style={styles.addressBox}>
                <Icon name="location-outline" type="ionicon" color="#4D7C0F" size={20} style={{ marginRight: 10 }} />
                <View>
                    <Text style={styles.addressTextBold}>{mockAddress.rua}, {mockAddress.numero}</Text>
                    <Text style={styles.addressText}>{mockAddress.bairro}, {mockAddress.cidade}</Text>
                    <Text style={styles.addressText}>CEP: {mockAddress.cep}</Text>
                </View>
            </View>
            <Button
                title="Alterar Endereço"
                type="clear"
                titleStyle={styles.clearButtonTitle}
                onPress={() => Alert.alert('Simulação', 'Função de Alterar Endereço')}
            />
        </View>
    );

    const PaymentSection = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Método de Pagamento</Text>
            {paymentMethods.map(method => (
                <TouchableOpacity
                    key={method.key}
                    style={[styles.paymentOption, selectedPayment === method.key && styles.paymentOptionSelected]}
                    onPress={() => setSelectedPayment(method.key)}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selectedPayment === method.key }}
                >
                    <Icon name={method.icon} type="ionicon" color={selectedPayment === method.key ? "#FFFFFF" : "#4D7C0F"} size={22} />
                    <Text style={[styles.paymentLabel, selectedPayment === method.key && styles.paymentLabelSelected]}>
                        {method.label}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );

    const TotalSummary = () => (
        <View style={styles.card}>
            <Text style={styles.sectionTitle}>Resumo do Pedido</Text>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Subtotal</Text>
                <Text style={styles.totalValue}>R$ {mockTotal.subtotal}</Text>
            </View>
            <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Frete</Text>
                <Text style={[styles.totalValue, mockTotal.shipping === '0,00' && styles.freeShipping]}>
                    {mockTotal.shipping === '0,00' ? 'GRÁTIS' : `R$ ${mockTotal.shipping}`}
                </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
                <Text style={styles.totalLabelFinal}>Total a Pagar</Text>
                <Text style={styles.totalValueFinal}>R$ {mockTotal.total}</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>Finalizar Compra</Text>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <AddressSection />
                <PaymentSection />
                <TotalSummary />
            </ScrollView>
            <View style={styles.fixedFooter}>
                <View style={styles.footerSummary}>
                    <Text style={styles.footerTotalLabel}>Total:</Text>
                    <Text style={styles.footerTotalValue}>R$ {mockTotal.total}</Text>
                </View>
                <Button
                    title="Confirmar Pedido"
                    buttonStyle={styles.confirmButton}
                    titleStyle={styles.confirmButtonTitle}
                    onPress={handlePlaceOrder}
                    accessibilityLabel="Confirmar e pagar o pedido"
                />
            </View>
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F0FDF4',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A2E05',
        textAlign: 'center',
        paddingVertical: 15,
    },
    scrollContent: {
        paddingHorizontal: 15,
        paddingBottom: 150,
    },
    card: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A2E05',
        marginBottom: 15,
        borderBottomWidth: 1,
        borderColor: '#E5E7EB',
        paddingBottom: 8,
    },
    addressBox: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 10,
        padding: 10,
        backgroundColor: '#F8FDEB',
        borderRadius: 8,
    },
    addressTextBold: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1A2E05',
    },
    addressText: {
        fontSize: 14,
        color: '#3F3F46',
    },
    clearButtonTitle: {
        color: '#65A30D',
        fontSize: 14,
        fontWeight: '600',
    },
    paymentOption: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 8,
        marginBottom: 10,
    },
    paymentOptionSelected: {
        backgroundColor: '#65A30D',
        borderColor: '#4D7C0F',
    },
    paymentLabel: {
        marginLeft: 10,
        fontSize: 16,
        color: '#1A2E05',
        fontWeight: '500',
    },
    paymentLabelSelected: {
        color: '#FFFFFF',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
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
    freeShipping: {
        color: '#4D7C0F',
        fontWeight: 'bold',
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
        color: '#4D7C0F',
    },
    fixedFooter: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#FFFFFF',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerSummary: {
        flex: 1,
    },
    footerTotalLabel: {
        fontSize: 14,
        color: '#52525B',
        marginBottom: 2,
    },
    footerTotalValue: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#4D7C0F',
    },
    confirmButton: {
        backgroundColor: '#65A30D',
        borderRadius: 10,
        paddingVertical: 15,
        paddingHorizontal: 30,
        minWidth: 180,
    },
    confirmButtonTitle: {
        fontSize: 16,
        fontWeight: 'bold',
    },
});
