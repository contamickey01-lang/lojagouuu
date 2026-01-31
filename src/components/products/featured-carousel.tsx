"use client";

import { useState, useEffect, useCallback } from "react";
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
    const [mounted, setMounted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const { addItem } = useCart();

    useEffect(() => {
        setMounted(true);
    }, []);

    const goToPrevious = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? products.length - 1 : prev - 1));
    }, [products.length]);

    const goToNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === products.length - 1 ? 0 : prev + 1));
    }, [products.length]);

    // Auto-play effect
    useEffect(() => {
        if (!mounted || products.length <= 1 || isPaused) return;

        const interval = setInterval(() => {
            goToNext();
        }, 5000);

        return () => clearInterval(interval);
    }, [mounted, products.length, goToNext, isPaused]);

    if (!products || products.length === 0) return null;

    const handleAddToCart = (e: React.MouseEvent, product: Product) => {
        e.preventDefault();
        addItem(product);
    };

    // Only render the interactive part after mounting to prevent hydration errors
    if (!mounted) {
        return <section className="relative w-full h-[400px] lg:h-[550px] bg-black" />;
    }

    return (
        <section
            className="relative w-full h-[400px] lg:h-[550px] overflow-hidden bg-black"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Slides Container */}
            <div
                className="flex h-full transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
                {products.map((product) => (
                    <div key={product.id} className="relative min-w-full h-full flex-shrink-0">
                        {/* Background Image/Video */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0">
                                {product.featuredVideoUrl ? (
                                    <video
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        className="w-full h-full object-cover"
                                    >
                                        <source src={product.featuredVideoUrl} type="video/mp4" />
                                    </video>
                                ) : (
                                    <Image
                                        src={product.featuredImageUrl || product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        priority={currentIndex === 0}
                                        unoptimized
                                    />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
                        </div>

                        {/* Content */}
                        <div className="relative z-10 container mx-auto h-full flex items-end lg:items-center px-4 lg:px-8 pt-20 sm:pt-0 pb-16 lg:pb-0">
                            <div className="max-w-xl space-y-6">
                                {product.category && (
                                    <span className="inline-block px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-medium uppercase tracking-wider">
                                        {product.category.name}
                                    </span>
                                )}

                                <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
                                    {product.name}
                                </h1>

                                <div className="flex items-center gap-4">
                                    {product.comparePrice > product.price && (
                                        <>
                                            <span className="text-xl text-muted-foreground line-through">
                                                {formatCurrency(product.comparePrice)}
                                            </span>
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-success text-sm font-bold text-white">
                                                -{product.discount}%
                                            </span>
                                        </>
                                    )}
                                    <span className="text-3xl lg:text-4xl font-bold text-primary">
                                        {formatCurrency(product.price)}
                                    </span>
                                </div>

                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={(e) => handleAddToCart(e, product)}
                                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
                                    >
                                        <ShoppingCart className="w-5 h-5" />
                                        Comprar Agora
                                    </button>
                                    <Link
                                        href={`/produto/${product.slug}`}
                                        className="px-6 py-3 rounded-xl border border-border hover:border-primary text-foreground font-semibold transition-colors"
                                    >
                                        Ver Detalhes
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
                <>
                    <button
                        onClick={goToPrevious}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:border-primary transition-colors"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-background/50 backdrop-blur-sm border border-border hover:border-primary transition-colors"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </>
            )}

            {/* Dots */}
            {products.length > 1 && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
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
