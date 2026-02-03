import { NextRequest, NextResponse } from "next/server";
import { getMercadoPagoClient } from "@/lib/mercadopago";
import { createClient } from "@supabase/supabase-js";

// Supabase Admin client for server-side updates
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
        const url = new URL(request.url);
        const type = url.searchParams.get("type");
        const dataId = url.searchParams.get("data.id");

        console.log(`[MP Webhook] Recebi notificação. Tipo: ${type}, ID: ${dataId}`);

        if (type === "payment" && dataId) {
            const payment = getMercadoPagoClient();
            const paymentDetails = await payment.get({ id: dataId });

            const status = paymentDetails.status;
            const externalReference = paymentDetails.external_reference; // Se tivéssemos definido

            console.log(`[MP Webhook] Pagamento ${dataId} está com status: ${status}`);

            // 1. Procurar pedido no Supabase pelo payment_id
            const supabase = getSupabaseAdmin();
            if (supabase) {
                const { data: order, error: fetchError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("payment_id", String(dataId))
                    .single();

                if (fetchError || !order) {
                    console.error("[MP Webhook] Pedido não encontrado no banco:", dataId);
                    return NextResponse.json({ received: true });
                }

                // 2. Atualizar status do pedido se for aprovado
                if (status === "approved") {
                    const { error: updateError } = await supabase
                        .from("orders")
                        .update({
                            status: "completed", // Ou "paid"
                            payment_status: "paid",
                            updated_at: new Date().toISOString()
                        })
                        .eq("payment_id", String(dataId));

                    if (updateError) {
                        console.error("[MP Webhook] Erro ao atualizar pedido:", updateError);
                    } else {
                        console.log(`[MP Webhook] Pedido ${order.id} marcado como PAGO!`);
                    }
                }
            }
        }

        return NextResponse.json({ received: true });

    } catch (error: any) {
        console.error("[MP Webhook] Erro processando notificação:", error.message);
        // Respondemos 200 para o MP não ficar tentando reenviar se for erro de lógica nosso
        return NextResponse.json({ received: true });
    }
}
