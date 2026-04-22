import React from "react";
import { View, Image, StyleSheet, Text, TouchableOpacity, ImageSourcePropType } from "react-native";
import { Icon } from '@rneui/themed'; 


interface CardProps {
    img: ImageSourcePropType; 
    title: string;
    price: string; 
    onPress: () => void; 
}



export const Card = ({ img, title, price, onPress }: CardProps) => { 
  return (
    <TouchableOpacity 
        style={styles.cardContainer} 
        
        onPress={onPress}
        accessibilityLabel={`Ver detalhes do produto ${title}, preço ${price}`}
    >
        <View style={styles.imageContainer}>
            <Image 
                source={img} 
                style={styles.image} 
                resizeMode="cover" 
            />
        </View>
        <View style={styles.textContainer}>
            {/* Título */}
            <Text style={styles.title} numberOfLines={2}>{title}</Text>
            
            
            <View style={styles.priceRow}>
                <Text style={styles.price}>{price}</Text>
                
                
                <TouchableOpacity 
                    style={styles.addToCartIcon} 
                    onPress={onPress} 
                    accessibilityLabel="Comprar ou adicionar ao carrinho"
                >
                    <Icon name="add-circle" type="ionicon" color="#FFFFFF" size={28} />
                </TouchableOpacity>
            </View>
        </View>
    </TouchableOpacity>
  );
};


const styles = StyleSheet.create({
    cardContainer: {
        flex: 1, 
        maxWidth: '48%', 
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        margin: '1%', 
        
        
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    imageContainer: {
        width: '100%',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        overflow: 'hidden', 
    },
    image: {
        width: '100%',
        height: 150, 
    },
    textContainer: {
        padding: 12,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1E293B', 
        minHeight: 34, 
        marginBottom: 4,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 6,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4D7C0F',
    },
    addToCartIcon: {
        backgroundColor: '#65A30D',
        borderRadius: 20,
        padding: 0,
        
    },
});