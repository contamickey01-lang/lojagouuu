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
}

export interface Category {
    id: number;
    name: string;
    slug: string;
}

export interface CartItem {
    product: Product;
    quantity: number;
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
