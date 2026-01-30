"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, CartItem, ProductVariant } from "@/types";

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product, selectedVariant?: ProductVariant, quantity?: number) => void;
    removeItem: (productId: number, variantName?: string) => void;
    updateQuantity: (productId: number, quantity: number, variantName?: string) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("gourp-cart");
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (e) {
                console.error("Error parsing cart:", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save cart to localStorage on change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("gourp-cart", JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (product: Product, selectedVariant?: ProductVariant, quantity: number = 1) => {
        setItems((prev) => {
            const existingItem = prev.find(
                (item) =>
                    item.product.id === product.id &&
                    item.selectedVariant?.name === selectedVariant?.name
            );

            if (existingItem) {
                return prev.map((item) =>
                    item.product.id === product.id &&
                        item.selectedVariant?.name === selectedVariant?.name
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [...prev, { product, quantity, selectedVariant }];
        });
    };

    const removeItem = (productId: number, variantName?: string) => {
        setItems((prev) => prev.filter(
            (item) => !(item.product.id === productId && item.selectedVariant?.name === variantName)
        ));
    };

    const updateQuantity = (productId: number, quantity: number, variantName?: string) => {
        if (quantity <= 0) {
            removeItem(productId, variantName);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.product.id === productId && item.selectedVariant?.name === variantName
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce(
        (sum, item) => {
            const price = item.selectedVariant ? item.selectedVariant.price : item.product.price;
            return sum + price * item.quantity;
        },
        0
    );

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                totalItems,
                totalPrice,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error("useCart must be used within a CartProvider");
    }
    return context;
}
