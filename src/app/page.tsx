"use client";

import { useMemo } from "react";
import { FeaturedCarousel } from "@/components/products/featured-carousel";
import { ProductGrid } from "@/components/products/product-grid";
import { useProducts } from "@/components/admin/products-provider";

export default function HomePage() {
    const { products } = useProducts();

    const featuredProducts = useMemo(() => {
        return products
            .filter((p) => p.isFeatured)
            .sort((a, b) => (a.featuredOrder || 99) - (b.featuredOrder || 99));
    }, [products]);

    const popularProducts = useMemo(() => {
        return [...products]
            .sort((a, b) => b.salesCount - a.salesCount)
            .slice(0, 10);
    }, [products]);

    return (
        <>
            {/* Featured Carousel */}
            <FeaturedCarousel products={featuredProducts} />

            {/* Popular Products Section */}
            <section className="px-4 sm:px-6 lg:px-10 py-8 lg:py-10">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-foreground text-2xl font-semibold">
                            Mais populares
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            Os títulos mais vendidos da semana
                        </p>
                    </div>
                </div>

                <ProductGrid products={popularProducts} />
            </section>

            {/* Features Section */}
            <section className="px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 10V3L4 14h7v7l9-11h-7z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Entrega Instantânea
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Receba seu produto automaticamente após a confirmação do pagamento
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            100% Seguro
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Todas as keys são originais e garantidas
                        </p>
                    </div>

                    <div className="flex flex-col items-center text-center p-6">
                        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                            <svg
                                className="w-8 h-8 text-primary"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-foreground mb-2">
                            Suporte 24/7
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Atendimento disponível a qualquer momento
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
}
