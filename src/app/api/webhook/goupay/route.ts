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

        // GouPay official format: body.event and body.data.ID
        const event = body.event;
        // The documentation shows "ID" inside "data"
        const txid = body.data?.ID || body.ID || body.transaction_id || body.id;
        const status = body.data?.status || body.status;

        console.log(`[Webhook GouPay] Evento: ${event}, txid identificado: ${txid}, status: ${status}`);

        if (!txid) {
            console.error("[Webhook GouPay] Payload sem ID de transação:", body);
            return NextResponse.json({ error: "Invalid payload: no transaction id" }, { status: 400 });
        }

        // Check for paid event or paid status
        const isPaid = event === "order.paid" || ['paid', 'completed', 'success', 'approved'].includes(String(status).toLowerCase());

        if (isPaid) {
            const supabase = getSupabaseAdmin();
            if (!supabase) {
                console.error("[Webhook GouPay] Erro: Supabase Admin não configurado.");
                return NextResponse.json({ error: "Server error: Supabase not configured" }, { status: 500 });
            }

            // 1. Buscar o pedido
            console.log(`[Webhook GouPay] Buscando pedido com payment_id: ${txid}`);
            const { data: order, error: fetchError } = await supabase
                .from("orders")
                .select("*")
                .eq("payment_id", String(txid))
                .single();

            if (fetchError || !order) {
                console.error(`[Webhook GouPay] Pedido não encontrado para payment_id: ${txid}`, fetchError);
                return NextResponse.json({ status: "not_found", message: "Order not found" });
            }

            console.log(`[Webhook GouPay] Pedido encontrado: ID ${order.id}, Status atual: ${order.status}`);

            if (order.status === "paid" || order.status === "concluido") {
                console.log(`[Webhook GouPay] Pedido ${order.id} já estava pago.`);
                return NextResponse.json({ status: "already_paid" });
            }

            // 2. Atualizar pedido
            console.log(`[Webhook GouPay] Atualizando pedido ${order.id} para pago...`);
            const { error: updateError } = await supabase
                .from("orders")
                .update({
                    status: "paid",
                    payment_status: "concluido",
                    paid_at: new Date().toISOString(),
                })
                .eq("id", order.id);

            if (updateError) {
                console.error(`[Webhook GouPay] Erro ao atualizar pedido ${order.id}:`, updateError);
                return NextResponse.json({ status: "error", message: "Failed to update order" }, { status: 500 });
            }

            console.log(`[Webhook GouPay] Pedido ${order.id} atualizado com sucesso!`);

            // 3. Atualizar estoque
            if (order.items && Array.isArray(order.items)) {
                console.log(`[Webhook GouPay] Atualizando estoque para ${order.items.length} itens...`);
                for (const item of order.items) {
                    try {
                        const { error: rpcError } = await supabase.rpc("decrement_stock", {
                            product_id: item.id,
                            quantity: item.quantity,
                        });

                        if (rpcError) {
                            console.error(`[Webhook GouPay] Erro RPC decrement_stock para item ${item.id}:`, rpcError);
                        }
                    } catch (e) {
                        console.error(`[Webhook GouPay] Erro ao processar estoque do item ${item.id}:`, e);
                    }
                }
            }
        } else {
            console.log(`[Webhook GouPay] Pagamento ainda não está em status de 'pago' (Status: ${status})`);
        }

        return NextResponse.json({ status: "ok" });
    } catch (error: any) {
        console.error("[Webhook GouPay] Erro crítico:", error.message);
        return NextResponse.json({ status: "error", message: error.message }, { status: 500 });
    }
}

