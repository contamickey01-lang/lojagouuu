"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product, Category } from "@/types";
import { products as mockProducts, categories as mockCategories } from "@/lib/mock-data";
import { getSupabase, dbProductToProduct, DBProduct, DBCategory } from "@/lib/supabase";

interface ProductsContextType {
    products: Product[];
    categories: Category[];
    isLoading: boolean;
    isUsingSupabase: boolean;
    addProduct: (product: Omit<Product, "id">) => Promise<void>;
    updateProduct: (id: number, updates: Partial<Product>) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    updateStock: (id: number, stock: number) => Promise<void>;
    refreshProducts: () => Promise<void>;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>(mockCategories);
    const [isLoading, setIsLoading] = useState(true);
    const [isUsingSupabase, setIsUsingSupabase] = useState(false);

    // Carregar produtos
    const loadProducts = async () => {
        setIsLoading(true);

        // Tentar carregar do Supabase (obtém cliente sob demanda)
        const supabase = getSupabase();

        if (supabase) {
            try {
                console.log("[Products] Tentando carregar do Supabase...");

                // Carregar categorias
                const { data: catData, error: catError } = await supabase
                    .from("categories")
                    .select("*");

                if (catError) {
                    console.error("[Products] Erro ao carregar categorias:", catError);
                } else if (catData && catData.length > 0) {
                    setCategories(catData as Category[]);
                    console.log("[Products] Categorias carregadas:", catData.length);
                }

                // Carregar produtos com categoria
                const { data: prodData, error } = await supabase
                    .from("products")
                    .select(`
                        *,
                        categories (
                            id,
                            name,
                            slug
                        )
                    `)
                    .order("sales_count", { ascending: false });

                if (error) {
                    console.error("[Products] Erro ao carregar produtos:", error);
                    throw error;
                }

                // SEMPRE usar Supabase se conectou, mesmo sem produtos
                setIsUsingSupabase(true);

                if (prodData && prodData.length > 0) {
                    const convertedProducts = prodData.map((p: DBProduct & { categories?: DBCategory }) =>
                        dbProductToProduct(p, p.categories || undefined)
                    );
                    setProducts(convertedProducts);
                    console.log("[Products] Produtos carregados do Supabase:", convertedProducts.length);
                } else {
                    console.log("[Products] Nenhum produto no Supabase ainda. Banco vazio.");
                    setProducts([]);
                }

                setIsLoading(false);
                return;
            } catch (error) {
                console.warn("[Products] Supabase não disponível, usando dados locais:", error);
            }
        }

        // Fallback: usar localStorage ou dados mock
        console.log("[Products] Usando modo local (localStorage)");
        const savedProducts = localStorage.getItem("gourp-products");
        if (savedProducts) {
            try {
                setProducts(JSON.parse(savedProducts));
            } catch {
                setProducts(mockProducts);
            }
        } else {
            setProducts(mockProducts);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    // Salvar no localStorage quando não usar Supabase
    useEffect(() => {
        if (!isLoading && !isUsingSupabase && products.length > 0) {
            localStorage.setItem("gourp-products", JSON.stringify(products));
        }
    }, [products, isLoading, isUsingSupabase]);

    const refreshProducts = async () => {
        await loadProducts();
    };

    const addProduct = async (product: Omit<Product, "id">) => {
        const supabase = getSupabase();

        if (isUsingSupabase && supabase) {
            const { error } = await supabase
                .from("products")
                .insert({
                    name: product.name,
                    slug: product.slug,
                    description: product.description,
                    image_url: product.imageUrl,
                    featured_image_url: product.featuredImageUrl || null,
                    featured_video_url: product.featuredVideoUrl || null,
                    price: product.price,
                    compare_price: product.comparePrice,
                    discount: product.discount,
                    stock: product.stock,
                    category_id: product.categoryId || null,
                    is_featured: product.isFeatured,
                    featured_order: product.featuredOrder || null,
                    sales_count: product.salesCount || 0,
                    variants: product.variants || null,
                })
                .select()
                .single();

            if (error) {
                console.error("[Products] Erro ao adicionar produto:", error);
                throw error;
            }
            console.log("[Products] Produto adicionado no Supabase");
            await refreshProducts();
        } else {
            const newId = Math.max(...products.map((p) => p.id), 0) + 1;
            setProducts((prev) => [...prev, { ...product, id: newId }]);
        }
    };

    const updateProduct = async (id: number, updates: Partial<Product>) => {
        const supabase = getSupabase();

        if (isUsingSupabase && supabase) {
            const dbUpdates: Record<string, unknown> = {};
            if (updates.name !== undefined) dbUpdates.name = updates.name;
            if (updates.slug !== undefined) dbUpdates.slug = updates.slug;
            if (updates.description !== undefined) dbUpdates.description = updates.description;
            if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
            if (updates.featuredImageUrl !== undefined) dbUpdates.featured_image_url = updates.featuredImageUrl;
            if (updates.featuredVideoUrl !== undefined) dbUpdates.featured_video_url = updates.featuredVideoUrl;
            if (updates.price !== undefined) dbUpdates.price = updates.price;
            if (updates.comparePrice !== undefined) dbUpdates.compare_price = updates.comparePrice;
            if (updates.discount !== undefined) dbUpdates.discount = updates.discount;
            if (updates.stock !== undefined) dbUpdates.stock = updates.stock;
            if (updates.categoryId !== undefined) dbUpdates.category_id = updates.categoryId;
            if (updates.isFeatured !== undefined) dbUpdates.is_featured = updates.isFeatured;
            if (updates.featuredOrder !== undefined) dbUpdates.featured_order = updates.featuredOrder;
            if (updates.salesCount !== undefined) dbUpdates.sales_count = updates.salesCount;
            if (updates.variants !== undefined) dbUpdates.variants = updates.variants;
            dbUpdates.updated_at = new Date().toISOString();

            const { error } = await supabase
                .from("products")
                .update(dbUpdates)
                .eq("id", id);

            if (error) {
                console.error("[Products] Erro ao atualizar produto:", error);
                throw error;
            }
            console.log("[Products] Produto atualizado no Supabase");
            await refreshProducts();
        } else {
            setProducts((prev) =>
                prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
            );
        }
    };

    const deleteProduct = async (id: number) => {
        const supabase = getSupabase();

        if (isUsingSupabase && supabase) {
            const { error } = await supabase
                .from("products")
                .delete()
                .eq("id", id);

            if (error) {
                console.error("[Products] Erro ao deletar produto:", error);
                throw error;
            }
            console.log("[Products] Produto deletado do Supabase");
            await refreshProducts();
        } else {
            setProducts((prev) => prev.filter((p) => p.id !== id));
        }
    };

    const updateStock = async (id: number, stock: number) => {
        await updateProduct(id, { stock });
    };

    return (
        <ProductsContext.Provider
            value={{
                products,
                categories,
                isLoading,
                isUsingSupabase,
                addProduct,
                updateProduct,
                deleteProduct,
                updateStock,
                refreshProducts,
            }}
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
