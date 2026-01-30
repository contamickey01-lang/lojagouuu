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
                "group relative flex flex-col rounded-2xl border border-border bg-card overflow-hidden card-hover",
                className
            )}
        >
            {/* Discount Badge */}
            {product.discount > 0 && (
                <div className="absolute top-3 left-3 z-10">
                    <span className="inline-flex items-center px-2 py-1 rounded-lg bg-success text-xs font-bold text-white">
                        -{product.discount}%
                    </span>
                </div>
            )}

            {/* Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
                <Image
                    src={product.imageUrl}
                    alt={product.name}
                    fill
                    className="object-cover product-img-zoom"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                />
            </div>

            {/* Content */}
            <div className="flex flex-col flex-1 p-4 gap-2">
                {/* Category */}
                {product.category && (
                    <span className="text-[11px] tracking-wider text-muted-foreground uppercase">
                        {product.category.name}
                    </span>
                )}

                {/* Name */}
                <h3 className="font-semibold text-foreground line-clamp-2 text-sm lg:text-base">
                    {product.name}
                </h3>

                {/* Price */}
                <div className="mt-auto pt-2 flex items-end justify-between gap-2">
                    <div className="flex flex-col">
                        {product.comparePrice > product.price && (
                            <span className="text-xs text-muted-foreground line-through">
                                {formatCurrency(product.comparePrice)}
                            </span>
                        )}
                        <span className="text-lg font-bold text-primary">
                            {formatCurrency(product.price)}
                        </span>
                    </div>

                    {/* Add to Cart Button */}
                    <button
                        onClick={handleAddToCart}
                        className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 hover:bg-primary text-primary hover:text-white transition-all"
                        aria-label="Adicionar ao carrinho"
                    >
                        <ShoppingCart className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </Link>
    );
}
