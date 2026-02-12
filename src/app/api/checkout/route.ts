import { NextRequest, NextResponse } from "next/server";
import { createPixOrder } from "@/lib/efi";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin client for server-side order creation
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return createClient(url, serviceKey);
    }
    return null;
}

interface CartItem {
    id: number;
    name: string;
    price: number;
    quantity: number;
    imageUrl: string;
}

interface CheckoutRequest {
    items: CartItem[];
    userEmail: string;
    userId?: string;
    payerName: string;
    payerCpf: string;
    paymentMethod?: "pix" | "credit_card";
    cardData?: any; // To be implemented with Efí Card token
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();
        const { items, userEmail, userId, payerName, payerCpf, paymentMethod = "pix" } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
        }

        if (!payerName || !payerCpf) {
            return NextResponse.json({ error: "Nome e CPF são obrigatórios" }, { status: 400 });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // 1. Criar pedido no Efí Bank
        let result: any;

        if (paymentMethod === "pix") {
            result = await createPixOrder(total, { name: payerName, cpf: payerCpf });
        } else if (paymentMethod === "credit_card") {
            // TODO: Implementar fluxo de cartão de crédito
            // Para cartão, precisamos do token gerado pelo SDK do Efí no frontend
            return NextResponse.json({ error: "Pagamento por cartão em fase de implementação" }, { status: 400 });
        } else {
            return NextResponse.json({ error: "Método de pagamento inválido" }, { status: 400 });
        }

        if (!result.id) {
            throw new Error("Falha ao criar pagamento no Efí Bank");
        }

        // 2. Criar pedido 'pendente' no Supabase para rastreio
        const supabase = getSupabaseAdmin();
        if (supabase) {
            const { error: orderError } = await supabase
                .from("orders")
                .insert({
                    payment_id: String(result.id),
                    user_id: userId || null,
                    user_email: userEmail,
                    items: items.map(i => ({ id: i.id, quantity: i.quantity })),
                    total: total,
                    status: "pending",
                    payment_status: "pending",
                    payment_method: paymentMethod,
                    created_at: new Date().toISOString(),
                });

            if (orderError) {
                console.error("[Checkout Efí] Erro ao salvar pedido:", orderError);
            }
        }

        // Retornar dados para o frontend
        return NextResponse.json({
            id: result.id,
            status: result.status,
            qr_code: result.qr_code,
            qr_code_base64: result.qr_code_base64,
        });

    } catch (error: any) {
        console.error("[Checkout Efí] Erro:", error);

        return NextResponse.json(
            { error: error.message || "Erro ao processar checkout" },
            { status: 500 }
        );
    }
}
