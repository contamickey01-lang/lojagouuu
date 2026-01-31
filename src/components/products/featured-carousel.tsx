"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";

interface FeaturedCarouselProps {
    products: Product[];
}

export function FeaturedCarousel({ products }: FeaturedCarouselProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const { addItem } = useCart();

    if (products.length === 0) return null;

    const currentProduct = products[currentIndex];

    const goToPrevious = () => {
        setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    };

    const goToNext = () => {
        setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        addItem(currentProduct);
    };

    return (
        <section className="relative w-full h-[400px] lg:h-[550px] overflow-hidden bg-black">
            {/* Background Image/Video */}
            <div className="absolute inset-0">
                {/* Main Content Layer - Full Width Cover */}
                <div className="absolute inset-0">
                    {currentProduct.featuredVideoUrl ? (
                        <video
                            key={currentProduct.id}
                            autoPlay
                            muted
                            loop
                            playsInline
                            className="w-full h-full object-fill"
                        >
                            <source src={currentProduct.featuredVideoUrl} type="video/mp4" />
                        </video>
                    ) : (
                        <Image
                            src={currentProduct.featuredImageUrl || currentProduct.imageUrl}
                            alt={currentProduct.name}
                            fill
                            className="object-fill"
                            priority
                            unoptimized
                        />
                    )}
                </div>
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto h-full flex items-end lg:items-center px-4 lg:px-8 pt-20 sm:pt-0 pb-16 lg:pb-0">
                <div className="max-w-xl space-y-6">
                    {/* Category Badge */}
                    {currentProduct.category && (
                        <span className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium uppercase tracking-wider">
                            {currentProduct.category.name}
                        </span>
                    )}

                    {/* Title */}
                    <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
                        {currentProduct.name}
                    </h1>

                    {/* Price */}
                    <div className="flex items-center gap-4">
                        {currentProduct.comparePrice > currentProduct.price && (
                            <>
                                <span className="text-xl text-muted-foreground line-through">
                                    {formatCurrency(currentProduct.comparePrice)}
                                </span>
                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-success text-sm font-bold text-white">
                                    -{currentProduct.discount}%
                                </span>
                            </>
                        )}
                        <span className="text-3xl lg:text-4xl font-bold text-primary">
                            {formatCurrency(currentProduct.price)}
                        </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={handleAddToCart}
                            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Comprar Agora
                        </button>
                        <Link
                            href={`/produto/${currentProduct.slug}`}
                            className="px-6 py-3 rounded-xl border border-border hover:border-primary text-foreground font-semibold transition-colors"
                        >
                            Ver Detalhes
                        </Link>
                    </div>
                </div>
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:border-primary transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:border-primary transition-colors"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {products.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                index === currentIndex
                                    ? "w-8 bg-primary"
                                    : "bg-white/30 hover:bg-white/50"
                            )}
                            aria-label={`Ir para slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
