"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle, Loader2 } from "lucide-react";

function PedidoSucessoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const paymentId = searchParams.get("payment_id");
  const status = searchParams.get("status");

  useEffect(() => {
    // Limpar carrinho após pagamento bem-sucedido
    if (typeof window !== "undefined") {
      localStorage.removeItem("gourp-cart");
      // Disparar evento para atualizar o header
      window.dispatchEvent(new Event("storage"));
    }
  }, []);

  return (
    <div className="max-w-md w-full text-center space-y-6">
      <div className="w-20 h-20 mx-auto bg-green-500/20 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-green-500" />
      </div>

      <h1 className="text-3xl font-bold text-foreground">
        Pagamento Aprovado!
      </h1>

      <p className="text-muted-foreground">
        Seu pedido foi processado com sucesso. Você receberá as keys no email cadastrado em breve.
      </p>

      {paymentId && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm text-muted-foreground">ID do Pagamento</p>
          <p className="font-mono text-sm">{paymentId}</p>
        </div>
      )}

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
  );
}

export default function PedidoSucessoPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Suspense fallback={
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando detalhes do pedido...</p>
        </div>
      }>
        <PedidoSucessoContent />
      </Suspense>
    </div>
  );
}
