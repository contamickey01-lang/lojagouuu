"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ShoppingCart, Check, ArrowLeft, Lock } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { ProductGrid } from "@/components/products/product-grid";
import { useProducts } from "@/components/admin/products-provider";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { useState, useMemo } from "react";
import { ProductVariant } from "@/types";

export default function ProductPage() {
    const params = useParams();
    const slug = params.slug as string;
    const { products } = useProducts();
    const { addItem } = useCart();
    const { user } = useAuth();
    const [added, setAdded] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const product = products.find((p) => p.slug === slug);

    // Inicializar variante padrão
    useMemo(() => {
        if (product?.variants && product.variants.length > 0 && !selectedVariant) {
            setSelectedVariant(product.variants[0]);
        }
    }, [product, selectedVariant]);

    if (!product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Produto não encontrado
                </h1>
                <p className="text-muted-foreground mb-6">
                    O produto que você está procurando não existe.
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Voltar para a loja
                </Link>
            </div>
        );
    }

    const relatedProducts = products
        .filter((p) => p.id !== product.id)
        .sort((a, b) => b.salesCount - a.salesCount)
        .slice(0, 4);

    const handleAddToCart = () => {
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        addItem(product, selectedVariant || undefined);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    return (
        <>
            <div className="min-h-screen pt-24">
                {/* Breadcrumb */}
                <div className="px-4 sm:px-6 lg:px-10 py-4 border-b border-border">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para a loja
                    </Link>
                </div>

                {/* Product Section */}
                <section className="px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                            {/* Image */}
                            <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
                                <Image
                                    src={product.imageUrl}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    quality={100}
                                />
                                {product.discount > 0 && (
                                    <div className="absolute top-4 left-4">
                                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-success text-sm font-bold text-white">
                                            -{product.discount}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Info */}
                            <div className="flex flex-col">
                                {/* Category */}
                                {product.category && (
                                    <span className="text-xs tracking-wider text-primary uppercase mb-2">
                                        {product.category.name}
                                    </span>
                                )}

                                {/* Title */}
                                <h1 className="text-3xl lg:text-4xl font-bold text-foreground mb-4">
                                    {product.name}
                                </h1>

                                {/* Price */}
                                <div className="flex items-center gap-4 mb-6">
                                    {product.comparePrice > product.price && (
                                        <span className="text-xl text-muted-foreground line-through">
                                            {formatCurrency(product.comparePrice)}
                                        </span>
                                    )}
                                    <span className="text-4xl font-bold text-primary">
                                        {formatCurrency(selectedVariant ? selectedVariant.price : product.price)}
                                    </span>
                                </div>

                                {/* Variants Selector */}
                                {product.variants && product.variants.length > 0 && (
                                    <div className="mb-8 p-4 bg-secondary/50 rounded-2xl border border-border">
                                        <h3 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                                            Escolha o Plano
                                        </h3>
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                            {product.variants.map((v) => (
                                                <button
                                                    key={v.name}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={cn(
                                                        "px-3 py-3 rounded-xl border text-sm font-medium transition-all flex flex-col items-center gap-1",
                                                        selectedVariant?.name === v.name
                                                            ? "bg-primary border-primary text-white shadow-lg shadow-primary/20 scale-105"
                                                            : "bg-background border-border text-muted-foreground hover:border-primary/50 hover:text-foreground"
                                                    )}
                                                >
                                                    <span>{v.name}</span>
                                                    <span className={cn(
                                                        "text-[10px]",
                                                        selectedVariant?.name === v.name ? "text-white/80" : "text-primary"
                                                    )}>
                                                        {formatCurrency(v.price)}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Stock & Sales */}
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="inline-flex items-center gap-1 text-sm text-success">
                                        <Check className="w-4 h-4" />
                                        Em estoque ({product.stock})
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        {product.salesCount.toLocaleString()} vendidos
                                    </span>
                                </div>

                                {/* Add to Cart */}
                                <button
                                    onClick={handleAddToCart}
                                    disabled={added}
                                    className={`flex items-center justify-center gap-2 w-full py-4 px-6 rounded-xl font-semibold transition-all ${added
                                        ? "bg-success text-white"
                                        : user
                                            ? "bg-primary hover:bg-primary-hover text-white"
                                            : "bg-secondary hover:bg-secondary/80 text-foreground border border-border"
                                        }`}
                                >
                                    {added ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Adicionado ao Carrinho!
                                        </>
                                    ) : user ? (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            Comprar Agora
                                        </>
                                    ) : (
                                        <>
                                            <Lock className="w-5 h-5" />
                                            Faça login para comprar
                                        </>
                                    )}
                                </button>

                                {/* Features */}
                                <div className="mt-8 pt-8 border-t border-border space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-primary"
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
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Entrega Instantânea
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Receba imediatamente após o pagamento
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                                            <svg
                                                className="w-5 h-5 text-primary"
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
                                        <div>
                                            <p className="font-medium text-foreground">
                                                Garantia de 30 dias
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Suporte para acesso e resolução de problemas
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="mt-8 pt-8 border-t border-border">
                                    <h2 className="text-lg font-semibold text-foreground mb-4">
                                        Descrição
                                    </h2>
                                    <p className="text-muted-foreground whitespace-pre-line">
                                        {product.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="px-4 sm:px-6 lg:px-10 py-12 border-t border-border">
                        <div className="max-w-7xl mx-auto">
                            <h2 className="text-2xl font-semibold text-foreground mb-6">
                                Você também pode gostar
                            </h2>
                            <ProductGrid products={relatedProducts} />
                        </div>
                    </section>
                )}
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
            />
        </>
    );
}
