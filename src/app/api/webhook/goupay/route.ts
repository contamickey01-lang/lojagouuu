import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceKey) {
        console.error("[Webhook GouPay] Erro: Variáveis de ambiente do Supabase ausentes!");
        return null;
    }
    return createClient(url, serviceKey);
}

export async function GET() {
    return NextResponse.json({
        status: "active",
        message: "GouPay Webhook endpoint is online. Use POST to send payloads."
    });
}

/**
 * GouPay Webhook Handler
 */
export async function POST(request: NextRequest) {
    const contentType = request.headers.get("content-type") || "";
    console.log(`[Webhook GouPay] Nova requisição POST recebida. Content-Type: ${contentType}`);

    try {
        let body: any = {};

        if (contentType.includes("application/json")) {
            body = await request.json();
        } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            body = Object.fromEntries(formData.entries());
        } else {
            const text = await request.text();
            console.log("[Webhook GouPay] Content-Type não mapeado. Tentando JSON do texto:", text.substring(0, 100));
            try {
                body = JSON.parse(text);
            } catch (e) {
                console.error("[Webhook GouPay] Falha ao processar corpo da requisição.");
                return NextResponse.json({ status: "ignored", message: "Unsupported format" });
            }
        }

        console.log("[Webhook GouPay] Payload Processado:", JSON.stringify(body, null, 2));

        // GouPay official format: body.event and body.data.ID
        const event = body.event || body.type || body.data?.event || body.request?.event;

        // Deep search for ID in common places
        const txid = body.data?.ID ||
            body.ID ||
            body.data?.id || // Tentando minúsculo também
            body.id ||       // Plano
            body.transaction_id ||
            body.request?.id ||
            body.payload?.id ||
            body.pix?.id ||
            body.pdu?.id;

        // Deep search for status
        const status = body.data?.status ||
            body.status ||
            body.payload?.status ||
            body.pix?.status ||
            body.pdu?.status;

        console.log(`[Webhook GouPay] Evento: ${event}, txid identificado: ${txid}, status: ${status}`);

        if (!txid) {
            console.warn("[Webhook GouPay] Payload sem ID de transação detectável.");
            return NextResponse.json({ status: "ignored", message: "no txid" });
        }

        /**
         * We consider it paid if:
         * 1. The event is 'order.paid'
         * 2. The status is one of the success strings
         * 3. OR, as a fallback for some gateways, if they send a webhook at all for a payment event
         */
        const isPaid = event?.includes("paid") ||
            event?.includes("success") ||
            ['paid', 'completed', 'success', 'approved', 'pago', 'concluido'].includes(String(status).toLowerCase());

        if (isPaid || (event && !status)) { // Assume paid if event exists but no status field (some gateways do this)
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
                .maybeSingle();

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

