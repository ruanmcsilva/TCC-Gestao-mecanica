// src/context/CartContext.tsx

import React, { createContext, useState, useContext, ReactNode } from 'react';


interface Product {
    id: number;
    nome: string;
    preco: string;
    img: any;
}

export interface CartItem extends Product {
    quantity: number;
}


interface CartContextType {
    cartItems: CartItem[];
    addItem: (product: Product, quantity: number) => void;
    removeItem: (id: number) => void;
    updateQuantity: (id: number, delta: 1 | -1) => void;
}


const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]); 

    const addItem = (product: Product, quantity: number) => {
        setCartItems(prevItems => {
            const existingItem = prevItems.find(item => item.id === product.id);

            if (existingItem) {
                return prevItems.map(item =>
                    item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
                );
            } else {
                return [...prevItems, { ...product, quantity }];
            }
        });
    };


    const removeItem = (id: number) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== id));
    };

    const updateQuantity = (id: number, delta: 1 | -1) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item
            ).filter(item => item.quantity > 0)
        );
    };

    const contextValue = { cartItems, addItem, removeItem, updateQuantity };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};