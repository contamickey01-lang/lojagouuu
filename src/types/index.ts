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
    customerEmail: string;
    status: "pending" | "paid" | "delivered" | "cancelled";
    total: number;
    items: OrderItem[];
    createdAt: string;
}

export interface OrderItem {
    productId: number;
    productName: string;
    quantity: number;
    price: number;
}
