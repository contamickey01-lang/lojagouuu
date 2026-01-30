"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Copy, Loader2, QrCode, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

interface PixPaymentProps {
    paymentId: number;
    qrCode: string;
    qrCodeBase64: string;
    onSuccess: () => void;
}

export function PixPayment({ paymentId, qrCode, qrCodeBase64, onSuccess }: PixPaymentProps) {
    const [copied, setCopied] = useState(false);
    const [status, setStatus] = useState<string>("pending");
    const [timeLeft, setTimeLeft] = useState(1800); // 30 minutos
    const router = useRouter();

    // Polling para verificar status do pagamento
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === "pending") {
            interval = setInterval(async () => {
                try {
                    const response = await fetch(`/api/order-status?paymentId=${paymentId}`);
                    const data = await response.json();

                    if (data.status === "approved" || data.status === "paid") {
                        setStatus("approved");
                        clearInterval(interval);
                        setTimeout(() => {
                            onSuccess();
                            router.push("/pedido/sucesso");
                        }, 2000);
                    }
                } catch (err) {
                    console.error("Erro ao verificar status:", err);
                }
            }, 5000); // Verificar a cada 5 segundos
        }

        return () => clearInterval(interval);
    }, [paymentId, status, onSuccess, router]);

    // Timer
    useEffect(() => {
        if (timeLeft > 0 && status === "pending") {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [timeLeft, status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(qrCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col items-center p-6 bg-card border border-border rounded-2xl space-y-6 animate-in fade-in zoom-in duration-300">
            <div className="text-center">
                <h3 className="text-xl font-bold flex items-center justify-center gap-2">
                    <QrCode className="text-primary" />
                    Pagamento via PIX
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                    Escaneie o QR Code ou copie a chave abaixo
                </p>
            </div>

            {status === "approved" ? (
                <div className="flex flex-col items-center py-8 space-y-4">
                    <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center">
                        <Check className="w-8 h-8 text-success" />
                    </div>
                    <p className="font-bold text-success text-lg">Pagamento Confirmado!</p>
                    <p className="text-sm text-muted-foreground">Redirecionando...</p>
                </div>
            ) : (
                <>
                    {/* QR Code */}
                    <div className="relative p-4 bg-white rounded-xl shadow-lg">
                        <div className="relative w-48 h-48">
                            <Image
                                src={`data:image/jpeg;base64,${qrCodeBase64}`}
                                alt="QR Code PIX"
                                fill
                                className="object-contain"
                            />
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-secondary rounded-full">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                        <span className="text-sm font-medium">
                            Aguardando pagamento: <span className="text-primary font-bold">{formatTime(timeLeft)}</span>
                        </span>
                    </div>

                    {/* Copia e Cola */}
                    <div className="w-full space-y-2">
                        <label className="text-xs font-semibold text-muted-foreground ml-1 uppercase">
                            Código Copia e Cola
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1 bg-secondary border border-border rounded-xl p-3 text-xs font-mono truncate">
                                {qrCode}
                            </div>
                            <button
                                onClick={copyToClipboard}
                                className="p-3 bg-primary hover:bg-primary-hover text-white rounded-xl transition-all active:scale-95 flex-shrink-0"
                            >
                                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                        <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            O acesso aos seus produtos será liberado <strong>instantaneamente</strong> após a confirmação do pagamento.
                        </p>
                    </div>
                </>
            )}
        </div>
    );
}
