import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";
import { createClient } from "@supabase/supabase-js";

// Configurar Mercado Pago
const mpClient = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

// Cliente Supabase com service role para operações do servidor
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return createClient(url, serviceKey);
    }
    return null;
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[Webhook MP] Recebido:", JSON.stringify(body, null, 2));

        // Verificar tipo de notificação
        if (body.type === "payment") {
            const paymentId = body.data?.id;

            if (!paymentId) {
                console.log("[Webhook MP] Sem payment ID");
                return NextResponse.json({ received: true });
            }

            // Buscar detalhes do pagamento
            const payment = new Payment(mpClient);
            const paymentData = await payment.get({ id: paymentId });

            console.log("[Webhook MP] Pagamento:", {
                id: paymentData.id,
                status: paymentData.status,
                external_reference: paymentData.external_reference,
            });

            // Processar apenas pagamentos aprovados
            if (paymentData.status === "approved") {
                const supabase = getSupabaseAdmin();

                if (supabase && paymentData.external_reference) {
                    try {
                        const orderData = JSON.parse(paymentData.external_reference);

                        // Criar pedido no banco
                        const { data: order, error } = await supabase
                            .from("orders")
                            .insert({
                                payment_id: String(paymentData.id),
                                user_id: orderData.userId || null,
                                user_email: orderData.userEmail,
                                items: orderData.items,
                                total: orderData.total,
                                status: "paid",
                                payment_status: paymentData.status,
                                payment_method: paymentData.payment_method_id,
                                created_at: orderData.createdAt,
                                paid_at: new Date().toISOString(),
                            })
                            .select()
                            .single();

                        if (error) {
                            console.error("[Webhook MP] Erro ao salvar pedido:", error);
                        } else {
                            console.log("[Webhook MP] Pedido salvo:", order.id);

                            // Atualizar estoque dos produtos
                            for (const item of orderData.items) {
                                await supabase.rpc("decrement_stock", {
                                    product_id: item.id,
                                    quantity: item.quantity,
                                });
                            }
                        }
                    } catch (parseError) {
                        console.error("[Webhook MP] Erro ao parsear external_reference:", parseError);
                    }
                }
            }
        }

        return NextResponse.json({ received: true });
    } catch (error) {
        console.error("[Webhook MP] Erro:", error);
        return NextResponse.json({ received: true });
    }
}

// GET para verificação do Mercado Pago
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
