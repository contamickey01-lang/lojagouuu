"use client";

import { Search } from "lucide-react";
import { ProductGrid } from "@/components/products/product-grid";
import { useProducts } from "@/components/admin/products-provider";

export default function LojaPage() {
    const { products, searchQuery } = useProducts();

    const filteredProducts = products.filter((p) => {
        const query = searchQuery.toLowerCase();
        return (
            p.name.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query)
        );
    });

    return (
        <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">
                        Nossa Loja
                    </h1>
                    <p className="text-muted-foreground">
                        Explore todos os nossos jogos e keys disponíveis
                    </p>
                </div>

                {/* Products Grid */}
                <ProductGrid products={filteredProducts} />

                {filteredProducts.length === 0 && (
                    <div className="text-center py-20 animate-in fade-in duration-500">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                            <Search className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold text-foreground mb-2">
                            Nenhum resultado para "{searchQuery}"
                        </h3>
                        <p className="text-muted-foreground">
                            Tente buscar por termos diferentes ou confira nossas categorias.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
