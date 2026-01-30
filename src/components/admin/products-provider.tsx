"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "@/types";
import { products as initialProducts } from "@/lib/mock-data";

interface ProductsContextType {
    products: Product[];
    addProduct: (product: Omit<Product, "id">) => void;
    updateProduct: (id: number, updates: Partial<Product>) => void;
    deleteProduct: (id: number) => void;
    updateStock: (id: number, stock: number) => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Carregar produtos do localStorage ou usar dados iniciais
    useEffect(() => {
        const savedProducts = localStorage.getItem("gourp-products");
        if (savedProducts) {
            try {
                setProducts(JSON.parse(savedProducts));
            } catch (e) {
                setProducts(initialProducts);
            }
        } else {
            setProducts(initialProducts);
        }
        setIsLoaded(true);
    }, []);

    // Salvar produtos no localStorage quando mudar
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("gourp-products", JSON.stringify(products));
        }
    }, [products, isLoaded]);

    const addProduct = (product: Omit<Product, "id">) => {
        const newId = Math.max(...products.map((p) => p.id), 0) + 1;
        const newProduct: Product = {
            ...product,
            id: newId,
        };
        setProducts((prev) => [...prev, newProduct]);
    };

    const updateProduct = (id: number, updates: Partial<Product>) => {
        setProducts((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };

    const deleteProduct = (id: number) => {
        setProducts((prev) => prev.filter((p) => p.id !== id));
    };

    const updateStock = (id: number, stock: number) => {
        updateProduct(id, { stock });
    };

    return (
        <ProductsContext.Provider
            value={{ products, addProduct, updateProduct, deleteProduct, updateStock }}
        >
            {children}
        </ProductsContext.Provider>
    );
}

export function useProducts() {
    const context = useContext(ProductsContext);
    if (context === undefined) {
        throw new Error("useProducts must be used within a ProductsProvider");
    }
    return context;
}
