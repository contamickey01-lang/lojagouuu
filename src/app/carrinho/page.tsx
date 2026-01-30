"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, CreditCard } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleCheckout = async () => {
        // Verificar se está logado
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        setIsProcessing(true);
        setError(null);

        try {
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items: items.map((item) => ({
                        id: item.product.id,
                        name: item.product.name,
                        price: item.product.price,
                        quantity: item.quantity,
                        imageUrl: item.product.imageUrl,
                    })),
                    userEmail: user.email,
                    userId: user.id,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao processar checkout");
            }

            // Redirecionar para o Mercado Pago
            if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error("URL de pagamento não disponível");
            }
        } catch (err) {
            console.error("Erro no checkout:", err);
            setError(err instanceof Error ? err.message : "Erro ao processar checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
                <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
                    <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Seu carrinho está vazio
                </h1>
                <p className="text-muted-foreground mb-6">
                    Adicione alguns jogos incríveis ao seu carrinho!
                </p>
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white font-semibold transition-colors"
                >
                    Explorar Loja
                    <ArrowRight className="w-5 h-5" />
                </Link>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen px-4 sm:px-6 lg:px-10 py-8 lg:py-12">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-3xl font-bold text-foreground mb-8">
                        Carrinho de Compras
                    </h1>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <div
                                    key={item.product.id}
                                    className="flex gap-4 p-4 rounded-2xl border border-border bg-card"
                                >
                                    {/* Image */}
                                    <Link
                                        href={`/produto/${item.product.slug}`}
                                        className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-secondary flex-shrink-0"
                                    >
                                        <Image
                                            src={item.product.imageUrl}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <Link
                                            href={`/produto/${item.product.slug}`}
                                            className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-2"
                                        >
                                            {item.product.name}
                                        </Link>

                                        {item.product.category && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {item.product.category.name}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-2">
                                            {item.product.comparePrice > item.product.price && (
                                                <span className="text-sm text-muted-foreground line-through">
                                                    {formatCurrency(item.product.comparePrice)}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-primary">
                                                {formatCurrency(item.product.price)}
                                            </span>
                                        </div>

                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-4 mt-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.product.id, item.quantity - 1)
                                                    }
                                                    className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                                                >
                                                    <Minus className="w-4 h-4" />
                                                </button>
                                                <span className="w-8 text-center font-medium">
                                                    {item.quantity}
                                                </span>
                                                <button
                                                    onClick={() =>
                                                        updateQuantity(item.product.id, item.quantity + 1)
                                                    }
                                                    className="w-8 h-8 rounded-lg bg-secondary hover:bg-secondary/80 flex items-center justify-center transition-colors"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <button
                                                onClick={() => removeItem(item.product.id)}
                                                className="text-destructive hover:text-destructive/80 transition-colors"
                                                aria-label="Remover item"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Subtotal */}
                                    <div className="hidden sm:flex flex-col items-end justify-center">
                                        <span className="text-sm text-muted-foreground">
                                            Subtotal
                                        </span>
                                        <span className="text-xl font-bold text-foreground">
                                            {formatCurrency(item.product.price * item.quantity)}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 p-6 rounded-2xl border border-border bg-card">
                                <h2 className="text-xl font-semibold text-foreground mb-6">
                                    Resumo do Pedido
                                </h2>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">
                                            Itens ({totalItems})
                                        </span>
                                        <span className="text-foreground">
                                            {formatCurrency(totalPrice)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Desconto</span>
                                        <span className="text-success">-R$ 0,00</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-border mb-6">
                                    <div className="flex justify-between">
                                        <span className="text-foreground font-semibold">Total</span>
                                        <span className="text-2xl font-bold text-primary">
                                            {formatCurrency(totalPrice)}
                                        </span>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mb-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                        <p className="text-sm text-destructive">{error}</p>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={isProcessing || authLoading}
                                    className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors flex items-center justify-center gap-2"
                                >
                                    {isProcessing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processando...
                                        </>
                                    ) : (
                                        <>
                                            <CreditCard className="w-5 h-5" />
                                            Finalizar Compra
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-muted-foreground text-center mt-4">
                                    Pagamento seguro via Mercado Pago
                                </p>

                                {/* Payment Methods */}
                                <div className="mt-4 pt-4 border-t border-border">
                                    <p className="text-xs text-muted-foreground text-center mb-2">
                                        Formas de pagamento
                                    </p>
                                    <div className="flex justify-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-2 py-1 bg-secondary rounded">PIX</span>
                                        <span className="px-2 py-1 bg-secondary rounded">Cartão</span>
                                        <span className="px-2 py-1 bg-secondary rounded">Boleto</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Auth Modal */}
            <AuthModal
                isOpen={showAuthModal}
                onClose={() => setShowAuthModal(false)}
                defaultTab="login"
            />
        </>
    );
}
