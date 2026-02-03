export interface ProductVariant {
    name: string;
    price: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    description: string;
    imageUrl: string;
    price: number;
    comparePrice: number;
    discount: number;
    stock: number;
    categoryId: number;
    category?: Category;
    salesCount: number;
    isFeatured: boolean;
    featuredImageUrl?: string;
    featuredVideoUrl?: string;
    featuredOrder?: number;
    variants?: ProductVariant[];
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
    selectedVariant?: ProductVariant;
}

export interface Order {
    id: string;
    payment_id: string;
    user_id?: string;
    user_email: string;
    status: "pending" | "paid" | "delivered" | "cancelled";
    payment_status: string;
    payment_method: string;
    total: number;
    items: OrderItem[];
    created_at: string;
    paid_at?: string;
}

export interface OrderItem {
    id: number;
    quantity: number;
}
