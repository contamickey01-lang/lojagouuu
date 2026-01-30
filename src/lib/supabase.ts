import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Cliente Supabase - singleton criado sob demanda
let supabaseInstance: SupabaseClient | null = null;
let initialized = false;

export function getSupabase(): SupabaseClient | null {
    // Se já foi inicializado, retorna o resultado (mesmo que seja null)
    if (initialized) return supabaseInstance;

    // Marca como inicializado para não tentar novamente
    initialized = true;

    // Verifica se as variáveis estão disponíveis
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    console.log("[Supabase] URL:", supabaseUrl ? "✓ Configurado" : "✗ Não configurado");
    console.log("[Supabase] Key:", supabaseAnonKey ? "✓ Configurado" : "✗ Não configurado");

    if (supabaseUrl && supabaseAnonKey && supabaseUrl.includes("supabase")) {
        try {
            supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
            console.log("[Supabase] Cliente criado com sucesso!");
            return supabaseInstance;
        } catch (error) {
            console.error("[Supabase] Erro ao criar cliente:", error);
        }
    }

    console.log("[Supabase] Usando modo local (localStorage)");
    return null;
}

// Tipos do banco de dados
export interface DBProduct {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    image_url: string;
    featured_image_url: string | null;
    featured_video_url: string | null;
    price: number;
    compare_price: number;
    discount: number;
    stock: number;
    category_id: number | null;
    is_featured: boolean;
    featured_order: number | null;
    sales_count: number;
    created_at: string;
    updated_at: string;
}

export interface DBCategory {
    id: number;
    name: string;
    slug: string;
    created_at: string;
}

// Converter do formato do banco para o formato da aplicação
export function dbProductToProduct(dbProduct: DBProduct, category?: DBCategory) {
    return {
        id: dbProduct.id,
        name: dbProduct.name,
        slug: dbProduct.slug,
        description: dbProduct.description || "",
        imageUrl: dbProduct.image_url,
        featuredImageUrl: dbProduct.featured_image_url || undefined,
        featuredVideoUrl: dbProduct.featured_video_url || undefined,
        price: Number(dbProduct.price),
        comparePrice: Number(dbProduct.compare_price),
        discount: dbProduct.discount,
        stock: dbProduct.stock,
        categoryId: dbProduct.category_id || 0,
        category: category ? {
            id: category.id,
            name: category.name,
            slug: category.slug,
        } : undefined,
        isFeatured: dbProduct.is_featured,
        featuredOrder: dbProduct.featured_order || undefined,
        salesCount: dbProduct.sales_count,
    };
}
