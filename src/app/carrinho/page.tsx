"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Loader2, CreditCard, User, CreditCard as IdCard } from "lucide-react";
import { useCart } from "@/components/cart/cart-provider";
import { useAuth } from "@/components/auth/auth-provider";
import { AuthModal } from "@/components/auth/auth-modal";
import { PixPayment } from "@/components/checkout/pix-payment";
import { formatCurrency } from "@/lib/utils";

export default function CartPage() {
    const { items, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
    const { user, isLoading: authLoading } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Novos campos para PIX
    const [payerName, setPayerName] = useState("");
    const [payerCpf, setPayerCpf] = useState("");

    // Estado do PIX gerado
    const [pixData, setPixData] = useState<{
        id: number;
        qr_code: string;
        qr_code_base64: string;
    } | null>(null);

    const formatCpf = (value: string) => {
        return value
            .replace(/\D/g, "")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d)/, "$1.$2")
            .replace(/(\d{3})(\d{1,2})/, "$1-$2")
            .replace(/(-\d{2})\d+?$/, "$1");
    };

    const handleCheckout = async () => {
        // Verificar se está logado
        if (!user) {
            setShowAuthModal(true);
            return;
        }

        // Validação básica
        if (!payerName.trim() || payerName.split(" ").length < 2) {
            setError("Por favor, insira seu nome completo.");
            return;
        }
        if (payerCpf.replace(/\D/g, "").length !== 11) {
            setError("Por favor, insira um CPF válido.");
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
                    payerName,
                    payerCpf,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Erro ao processar checkout");
            }

            // Salvar dados do PIX para mostrar o componente
            if (data.qr_code) {
                setPixData({
                    id: data.id,
                    qr_code: data.qr_code,
                    qr_code_base64: data.qr_code_base64,
                });
            } else if (data.init_point) {
                window.location.href = data.init_point;
            } else {
                throw new Error("Resposta do pagamento inválida");
            }
        } catch (err) {
            console.error("Erro no checkout:", err);
            setError(err instanceof Error ? err.message : "Erro ao processar checkout");
        } finally {
            setIsProcessing(false);
        }
    };

    if (items.length === 0 && !pixData) {
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
                    <h1 className="text-3xl font-bold text-foreground mb-8 text-center lg:text-left">
                        {pixData ? "Finalize seu Pagamento" : "Carrinho de Compras"}
                    </h1>

                    <div className={`grid grid-cols-1 ${pixData ? "max-w-xl mx-auto" : "lg:grid-cols-3"} gap-8`}>
                        {pixData ? (
                            <div className="w-full">
                                <PixPayment
                                    paymentId={pixData.id}
                                    qrCode={pixData.qr_code}
                                    qrCodeBase64={pixData.qr_code_base64}
                                    onSuccess={() => {
                                        clearCart();
                                    }}
                                />
                                <button
                                    onClick={() => setPixData(null)}
                                    className="w-full mt-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancelar e voltar ao carrinho
                                </button>
                            </div>
                        ) : (
                            <>
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

                                        {/* Payer Info Form */}
                                        <div className="space-y-4 mb-6">
                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                    <User className="w-3 h-3" /> Nome Completo
                                                </label>
                                                <input
                                                    type="text"
                                                    value={payerName}
                                                    onChange={(e) => setPayerName(e.target.value)}
                                                    placeholder="Como no seu CPF"
                                                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm transition-all"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1">
                                                    <IdCard className="w-3 h-3" /> CPF
                                                </label>
                                                <input
                                                    type="text"
                                                    value={payerCpf}
                                                    onChange={(e) => setPayerCpf(formatCpf(e.target.value))}
                                                    placeholder="000.000.000-00"
                                                    className="w-full px-4 py-3 rounded-xl bg-secondary border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm font-mono transition-all"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 mb-6 border-t border-border pt-4">
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
                                            className="w-full py-4 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                                        >
                                            {isProcessing ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 animate-spin" />
                                                    Gerando PIX...
                                                </>
                                            ) : (
                                                <>
                                                    <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center font-bold text-[10px]">PX</div>
                                                    Gerar QR Code PIX
                                                </>
                                            )}
                                        </button>

                                        <p className="text-[10px] text-muted-foreground text-center mt-4 leading-tight">
                                            Ao clicar, você concorda em gerar um pagamento via PIX.
                                            Seus dados são processados com segurança pelo Mercado Pago.
                                        </p>
                                    </div>
                                </div>
                            </>
                        )}
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
