"use client";

import { useRouter } from "next/navigation";
import { Clock } from "lucide-react";

export default function PedidoPendentePage() {
    const router = useRouter();

    return (
        <div className="min-h-[80vh] flex items-center justify-center p-4">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center">
                    <Clock className="w-10 h-10 text-yellow-500" />
                </div>

                <h1 className="text-3xl font-bold text-foreground">
                    Pagamento Pendente
                </h1>

                <p className="text-muted-foreground">
                    Seu pagamento está sendo processado. Assim que for confirmado, você receberá as keys no email cadastrado.
                </p>

                <div className="bg-card border border-border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground">
                        Para pagamentos via PIX ou boleto, aguarde a confirmação bancária.
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => router.push("/loja")}
                        className="w-full py-3 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg font-medium transition-colors"
                    >
                        Continuar Comprando
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
