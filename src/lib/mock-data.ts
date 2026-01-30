import { Product, Category } from "@/types";

// Categories
export const categories: Category[] = [
    { id: 1, name: "Steam Keys", slug: "steam-keys" },
    { id: 2, name: "Steam Offline", slug: "steam-offline" },
    { id: 3, name: "Gift Cards", slug: "gift-cards" },
    { id: 4, name: "FiveM", slug: "fivem" },
];

// Products
export const products: Product[] = [
    {
        id: 86,
        name: "Clair Obscur: Expedition 33",
        slug: "clair-obscur-expedition-33",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/aa.jpg",
        price: 14.99,
        comparePrice: 190,
        discount: 92,
        stock: 74,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 278,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/aa.jpg",
        featuredOrder: 1,
    },
    {
        id: 43,
        name: "The Last of Us Parte I",
        slug: "the-last-of-us-parte-i",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/thumb-1920-1246104.png",
        price: 8.9,
        comparePrice: 299.9,
        discount: 97,
        stock: 110,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 1487,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/885-3840x2160-desktop-4k-the-last-of-us-game-background.jpg",
        featuredOrder: 3,
    },
    {
        id: 94,
        name: "Marvel's Spider-Man 2 Deluxe Edition",
        slug: "marvels-spider-man-2-deluxe-edition",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/EGS_MarvelsSpiderManDigitalDeluxeEdition_InsomniacGamesNixxesSoftware_Editions_S2_1200x1600-148e0014e79aa7c2cb23ae2414b11a16.jpeg",
        price: 14.99,
        comparePrice: 250,
        discount: 94,
        stock: 136,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 917,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/1234.png",
        featuredOrder: 4,
    },
    {
        id: 35,
        name: "God of War Ragnarök",
        slug: "god-of-war-ragnarok",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/God%20of%20War%20Ragnaro%CC%88k%20Capa.jpg",
        price: 9.8,
        comparePrice: 199.92,
        discount: 95,
        stock: 173,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 1035,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/god-of-war-coll.jpg",
        featuredOrder: 5,
    },
    {
        id: 73,
        name: "The Last of Us Parte II Remastered",
        slug: "the-last-of-us-parte-ii-remastered",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/The%20Last%20of%20Us%20Parte%20II%20Capa.jpg",
        price: 14.99,
        comparePrice: 199.8,
        discount: 92,
        stock: 81,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 681,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/the_last_of_us_2013_game.jpg",
        featuredOrder: 6,
    },
    {
        id: 42,
        name: "ELDEN RING",
        slug: "elden-ring",
        description: "Conta Compartilhada da Steam para jogar no seu PC o jogo escolhido no modo offline.",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/00ab2a44-32a6-4655-b8d0-a5b7b74dc093.webp",
        price: 9.9,
        comparePrice: 309.9,
        discount: 96,
        stock: 73,
        categoryId: 11,
        category: { id: 11, name: "Steam Offline", slug: "steam-offline" },
        salesCount: 1972,
        isFeatured: true,
        featuredImageUrl: "https://ecommerce-cdn.b-cdn.net/steamkeys-produtos/1169015.jpg",
        featuredOrder: 9,
    },
    {
        id: 5,
        name: "Steam Keys Premium",
        slug: "steam-keys-premium",
        description: "Chaves Steam Premium – Sorteie Jogos Aleatórios e Ganhe Títulos Famosos!",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/STEAMKEYPREMIUMCYBERPUNK.png",
        price: 5,
        comparePrice: 20.99,
        discount: 76,
        stock: 32,
        categoryId: 1,
        category: { id: 1, name: "SteamKeys (aleatórias)", slug: "steam-keys-aleatorias" },
        salesCount: 53842,
        isFeatured: false,
    },
    {
        id: 4,
        name: "Steam Keys de Jogos +18",
        slug: "steam-keys-jogos-18",
        description: "Key Steam 18+ - Desbloqueie o mundo dos jogos adultos com acesso imediato!",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/STEAMKEYHENTAI.png",
        price: 0.99,
        comparePrice: 5.99,
        discount: 83,
        stock: 354,
        categoryId: 1,
        category: { id: 1, name: "SteamKeys (aleatórias)", slug: "steam-keys-aleatorias" },
        salesCount: 41911,
        isFeatured: false,
    },
    {
        id: 6,
        name: "Steam Keys Platina",
        slug: "steam-keys-platina",
        description: "Chave Steam Platina - Jogo Aleatório (Fácil de Platinar)",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/THUMB%2004.png",
        price: 1.99,
        comparePrice: 14.99,
        discount: 86,
        stock: 152,
        categoryId: 1,
        category: { id: 1, name: "SteamKeys (aleatórias)", slug: "steam-keys-aleatorias" },
        salesCount: 8453,
        isFeatured: false,
    },
    {
        id: 2,
        name: "Steam Key Cartas",
        slug: "steam-key-cartas",
        description: "Chaves de jogos Steam com cartas colecionáveis – entrega automática!",
        imageUrl: "https://ecommerce-cdn.b-cdn.net/STEAMKEYCARTAS.png",
        price: 1.49,
        comparePrice: 10.99,
        discount: 86,
        stock: 15,
        categoryId: 1,
        category: { id: 1, name: "SteamKeys (aleatórias)", slug: "steam-keys-aleatorias" },
        salesCount: 4780,
        isFeatured: false,
    },
];

// Helper functions
export function getFeaturedProducts(): Product[] {
    return products
        .filter((p) => p.isFeatured)
        .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
}

export function getPopularProducts(limit: number = 8): Product[] {
    return [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, limit);
}

export function getProductBySlug(slug: string): Product | undefined {
    return products.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string): Product[] {
    return products.filter((p) => p.category?.slug === categorySlug);
}
