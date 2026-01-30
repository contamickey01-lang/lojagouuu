"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useCart } from "@/components/cart/cart-provider";

interface ProductCardProps {
    product: Product;
    className?: string;
}

export function ProductCard({ product, className }: ProductCardProps) {
    const { addItem } = useCart();

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addItem(product);
    };

    return (
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
                    sizes="(max-width: 640px) 33vw, (max-width: 1024px) 20vw, 14vw"
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
                        className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-md bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all"
                        aria-label="Adicionar ao carrinho"
                    >
                        <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
