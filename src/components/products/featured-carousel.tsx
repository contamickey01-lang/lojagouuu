"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart, Star, Eye } from "lucide-react";
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
                        <div className="relative z-10 container mx-auto h-full flex items-center px-4 lg:px-8">
                            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr] gap-12 items-center w-full">
                                {/* Left: Poster (Desktop Only) */}
                                <div className="hidden lg:block w-72 h-[420px] relative rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 group-hover:scale-[1.02] transition-transform duration-500">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                </div>

                                {/* Right: Details */}
                                <div className="max-w-2xl space-y-6">
                                    <div className="flex flex-wrap items-center gap-3">
                                        {product.category && (
                                            <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/80 text-[10px] font-semibold uppercase tracking-widest">
                                                {product.category.name}
                                            </span>
                                        )}
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 text-[10px] font-bold">
                                            <Star className="w-3 h-3 fill-current" />
                                            <span>4.8</span>
                                        </div>
                                    </div>

                                    <h1 className="text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
                                        {product.name}
                                    </h1>

                                    <div className="flex items-center gap-6 text-white/60 text-sm font-medium">
                                        <div className="flex items-center gap-2">
                                            <Eye className="w-4 h-4 text-primary" />
                                            <span>278.000 visualizações</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <ShoppingCart className="w-4 h-4 text-primary" />
                                            <span>219 vendas</span>
                                        </div>
                                        <div className="flex items-center gap-1 text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} className={cn("w-3.5 h-3.5 fill-current", i === 4 && "opacity-30")} />
                                            ))}
                                            <span className="ml-1">4.5K</span>
                                        </div>
                                    </div>

                                    <p className="text-white/60 line-clamp-2 text-sm max-w-lg leading-relaxed">
                                        {product.description || "Entrega automática 24/7. Produto original com garantia total e suporte dedicado."}
                                    </p>

                                    <div className="flex items-end gap-3 pt-2">
                                        <div className="flex flex-col">
                                            {product.comparePrice > product.price && (
                                                <span className="text-sm text-white/40 line-through font-medium">
                                                    {formatCurrency(product.comparePrice)}
                                                </span>
                                            )}
                                            <span className="text-4xl font-black text-white">
                                                {formatCurrency(product.price)}
                                            </span>
                                        </div>
                                        {product.comparePrice > product.price && (
                                            <span className="mb-1.5 px-2 py-0.5 rounded-md bg-primary text-[11px] font-black text-white uppercase tracking-tighter">
                                                -{product.discount}% OFF
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4 pt-4">
                                        <button
                                            onClick={(e) => handleAddToCart(e, product)}
                                            className="h-12 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-bold transition-all shadow-lg shadow-primary/20 hover:scale-105 active:scale-95"
                                        >
                                            Comprar Agora
                                        </button>
                                        <Link
                                            href={`/produto/${product.slug}`}
                                            className="h-12 px-8 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
                                        >
                                            Ver Detalhes
                                        </Link>
                                    </div>

                                    <div className="text-[10px] font-bold text-white/40 flex items-center gap-2 uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        72 unidades disponíveis em estoque
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Navigation Arrows */}
            {products.length > 1 && (
                <div className="absolute right-8 bottom-8 z-20 flex gap-3">
                    <button
                        onClick={goToPrevious}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                        aria-label="Anterior"
                    >
                        <ChevronLeft className="w-5 h-5 group-active:scale-75 transition-transform" />
                    </button>
                    <button
                        onClick={goToNext}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-white group"
                        aria-label="Próximo"
                    >
                        <ChevronRight className="w-5 h-5 group-active:scale-75 transition-transform" />
                    </button>
                </div>
            )}

            {/* Dots */}
            {products.length > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                    {products.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                "h-1 rounded-full transition-all duration-300",
                                index === currentIndex
                                    ? "w-8 bg-white"
                                    : "w-2 bg-white/20 hover:bg-white/40"
                            )}
                            aria-label={`Ir para slide ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}
