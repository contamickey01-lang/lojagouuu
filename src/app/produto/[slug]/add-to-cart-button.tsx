"use client";

import { ShoppingCart, Check } from "lucide-react";
import { useState } from "react";
import { Product } from "@/types";
import { useCart } from "@/components/cart/cart-provider";

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addItem } = useCart();
    const [added, setAdded] = useState(false);

    const handleClick = () => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <button
            onClick={handleClick}
            disabled={added}
            className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold transition-all ${added
                    ? "bg-success text-white"
                    : "bg-primary hover:bg-primary-hover text-white"
                }`}
        >
            {added ? (
                <>
                    <Check className="w-5 h-5" />
                    Adicionado ao Carrinho!
                </>
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5" />
                    Comprar Agora
                </>
            )}
        </button>
    );
}
