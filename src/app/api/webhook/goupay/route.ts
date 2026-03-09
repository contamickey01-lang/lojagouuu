import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return createClient(url, serviceKey);
    }
    return null;
}

/**
 * GouPay Webhook Handler
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[Webhook GouPay] Recebido:", JSON.stringify(body, null, 2));

        // GouPay can send payload in different formats
        const txid = body.transaction_id || body.id || body.pix?.id || body.pdu?.id || body.txid;
        const status = body.status || body.pix?.status || body.pdu?.status;

        console.log(`[Webhook GouPay] txid identificado: ${txid}, status: ${status}`);

        if (!txid) {
            console.error("[Webhook GouPay] Payload sem ID de transação:", body);
            return NextResponse.json({ error: "Invalid payload: no transaction id" }, { status: 400 });
        }

        // status can be 'paid', 'completed', 'success' or even 'approved'
        const isPaid = ['paid', 'completed', 'success', 'approved', 'pago', 'concluido'].includes(String(status).toLowerCase());

        if (isPaid) {
            const supabase = getSupabaseAdmin();
            if (!supabase) {
                return NextResponse.json({ error: "Server error" }, { status: 500 });
            }

            // 1. Buscar o pedido
            const { data: order, error: fetchError } = await supabase
                .from("orders")
                .select("*")
                .eq("payment_id", String(txid))
                .single();

            if (fetchError || !order) {
                console.error(`[Webhook GouPay] Pedido não encontrado para txid: ${txid}`);
                return NextResponse.json({ status: "not_found" });
            }

            if (order.status === "paid") {
                return NextResponse.json({ status: "already_paid" });
            }

            // 2. Atualizar pedido
            await supabase
                .from("orders")
                .update({
                    status: "paid",
                    payment_status: "concluido",
                    paid_at: new Date().toISOString(),
                })
                .eq("id", order.id);

            // 3. Atualizar estoque
            if (order.items && Array.isArray(order.items)) {
                for (const item of order.items) {
                    await supabase.rpc("decrement_stock", {
                        product_id: item.id,
                        quantity: item.quantity,
                    });
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[Webhook GouPay] Erro:", error);
        return NextResponse.json({ status: "error" }, { status: 500 });
    }
}
