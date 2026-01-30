"use client";

import { useRouter } from "next/navigation";
import { XCircle } from "lucide-react";

export default function PedidoFalhaPage() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-red-500/20 rounded-full flex items-center justify-center">
                    <XCircle className="w-10 h-10 text-red-500" />
                </div>

                <h1 className="text-3xl font-bold text-foreground">
                    Pagamento não Aprovado
                </h1>

                <p className="text-muted-foreground">
                    Infelizmente seu pagamento não foi processado. Por favor, tente novamente ou escolha outra forma de pagamento.
                </p>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push("/carrinho")}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        Tentar Novamente
                    </button>

                    <button
                        onClick={() => router.push("/")}
                        className="w-full py-3 px-4 border border-border hover:bg-muted rounded-lg font-medium transition-colors"
                    >
                        Voltar para Início
                    </button>
                </div>
            </div>
        </div>
    );
}
