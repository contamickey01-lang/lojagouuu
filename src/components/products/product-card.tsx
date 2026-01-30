"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Lock } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { addItem } = useCart();
    const { user } = useAuth();
    const [showAuthModal, setShowAuthModal] = useState(false);

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setShowAuthModal(true);
            return;
        }

        addItem(product);
    };

    return (
        <>
            <Link
                href={`/produto/${product.slug}`}
                className={cn(
                    "group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden card-hover",
                    className
                )}
            >
                {/* Discount Badge */}
                {product.discount > 0 && (
                    <div className="absolute top-2 left-2 z-10">
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-success text-[10px] font-bold text-white">
                            -{product.discount}%
                        </span>
                    </div>
                )}

                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
                    <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover product-img-zoom"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        quality={90}
                    />
                </div>

                {/* Content */}
                <div className="flex flex-col flex-1 p-2 sm:p-3 gap-1">
                    {/* Category */}
                    {product.category && (
                        <span className="text-[9px] sm:text-[10px] tracking-wider text-muted-foreground uppercase truncate">
                            {product.category.name}
                        </span>
                    )}

                    {/* Name */}
                    <h3 className="font-semibold text-foreground line-clamp-2 text-xs sm:text-sm">
                        {product.name}
                    </h3>

                    {/* Price */}
                    <div className="mt-auto pt-1 flex items-end justify-between gap-1">
                        <div className="flex flex-col">
                            {product.comparePrice > product.price && (
                                <span className="text-[10px] text-muted-foreground line-through">
                                    {formatCurrency(product.comparePrice)}
                                </span>
                            )}
                            <span className="text-sm sm:text-base font-bold text-primary">
                                {formatCurrency(product.price)}
                            </span>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            className={cn(
                                "flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md transition-all",
                                user
                                    ? "bg-primary/10 hover:bg-primary text-primary hover:text-white"
                                    : "bg-secondary hover:bg-secondary/80 text-muted-foreground"
                            )}
                            aria-label={user ? "Adicionar ao carrinho" : "Faça login para comprar"}
                            title={user ? "Adicionar ao carrinho" : "Faça login para comprar"}
                        >
                            {user ? (
                                <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            ) : (
                                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            )}
                        </button>
                    </div>
                </div>
            </Link>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
