import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoClient } from "@/lib/mercadopago";
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
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();
        const { items, userEmail, userId, payerName, payerCpf } = body;

        if (!items || items.length === 0) {
            return NextResponse.json({ error: "Carrinho vazio" }, { status: 400 });
        }

        if (!payerName || !payerCpf) {
            return NextResponse.json({ error: "Nome e CPF são obrigatórios para PIX" }, { status: 400 });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Limpar CPF
        const cleanCpf = payerCpf.replace(/\D/g, "");

        // Separar nome e sobrenome (Mercado Pago pede separado)
        const nameParts = payerName.trim().split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : firstName;

        // 1. Criar pedido no Mercado Pago
        const payment = getMercadoPagoClient();

        // Gerar uma URL de notificação automática (Vercel URL + hook)
        const protocol = request.headers.get("x-forwarded-proto") || "https";
        const host = request.headers.get("host");
        const notificationUrl = `${protocol}://${host}/api/webhooks/mercadopago`;

        const paymentData = {
            body: {
                transaction_amount: total,
                description: `Compra na GouPay - ${items.length} itens`,
                payment_method_id: "pix",
                payer: {
                    email: userEmail,
                    first_name: firstName,
                    last_name: lastName,
                    identification: {
                        type: "CPF",
                        number: cleanCpf,
                    },
                },
                notification_url: notificationUrl,
                metadata: {
                    user_id: userId || "guest",
                    items: JSON.stringify(items.map(i => ({ id: i.id, q: i.quantity }))),
                }
            }
        };

        const result = await payment.create(paymentData);

        if (!result.id) {
            throw new Error("Falha ao criar pagamento no Mercado Pago");
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
                    payment_method: "pix",
                    created_at: new Date().toISOString(),
                });

            if (orderError) {
                console.error("[Checkout MP] Erro ao salvar pedido:", orderError);
            }
        }

        // Retornar dados para o frontend
        const transactionData = result.point_of_interaction?.transaction_data;

        return NextResponse.json({
            id: result.id,
            status: result.status,
            qr_code: transactionData?.qr_code,
            qr_code_base64: transactionData?.qr_code_base64,
            ticket_url: transactionData?.ticket_url,
        });

    } catch (error: any) {
        console.error("[Checkout MP] Erro:", error);

        let message = "Erro ao processar checkout";
        if (error.cause && Array.isArray(error.cause)) {
            message = error.cause[0]?.description || message;
        } else if (error.message) {
            message = error.message;
        }

        return NextResponse.json(
            { error: message },
            { status: 500 }
        );
    }
}
