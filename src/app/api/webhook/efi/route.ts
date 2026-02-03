import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Cliente Supabase com service role para operações do servidor
function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return createClient(url, serviceKey);
    }
    return null;
}

/**
 * Efí Bank Webhook Handler for PIX
 * Documentation: https://dev.sejaefi.com.br/docs/api-pix/webhooks
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        console.log("[Webhook Efí] Recebido:", JSON.stringify(body, null, 2));

        // Efí envia um array 'pix' com as confirmações
        if (body.pix && Array.isArray(body.pix)) {
            const supabase = getSupabaseAdmin();
            if (!supabase) {
                console.error("[Webhook Efí] Supabase não configurado.");
                return NextResponse.json({ error: "Server error" }, { status: 500 });
            }

            for (const payment of body.pix) {
                const txid = payment.txid;

                if (!txid) continue;

                console.log(`[Webhook Efí] Processando pagamento txid: ${txid}`);

                // 1. Buscar o pedido pelo txid (payment_id no banco)
                const { data: order, error: fetchError } = await supabase
                    .from("orders")
                    .select("*")
                    .eq("payment_id", txid)
                    .single();

                if (fetchError || !order) {
                    console.error(`[Webhook Efí] Pedido não encontrado para txid: ${txid}`, fetchError);
                    continue;
                }

                // 2. Se já estiver pago, ignora
                if (order.status === "paid") {
                    console.log(`[Webhook Efí] Pedido ${order.id} já está marcado como pago.`);
                    continue;
                }

                // 3. Atualizar pedido para 'pago'
                const { error: updateError } = await supabase
                    .from("orders")
                    .update({
                        status: "paid",
                        payment_status: "concluido",
                        paid_at: payment.horario || new Date().toISOString(),
                    })
                    .eq("id", order.id);

                if (updateError) {
                    console.error(`[Webhook Efí] Erro ao atualizar pedido ${order.id}:`, updateError);
                    continue;
                }

                console.log(`[Webhook Efí] Pedido ${order.id} confirmado com sucesso!`);

                // 4. Atualizar estoque dos produtos
                // order.items é um array de { id, quantity }
                if (order.items && Array.isArray(order.items)) {
                    for (const item of order.items) {
                        try {
                            const { error: rpcError } = await supabase.rpc("decrement_stock", {
                                product_id: item.id,
                                quantity: item.quantity,
                            });

                            if (rpcError) {
                                console.error(`[Webhook Efí] Erro ao decrementar estoque para item ${item.id}:`, rpcError);
                            }
                        } catch (stkError) {
                            console.error(`[Webhook Efí] Erro inesperado no estoque:`, stkError);
                        }
                    }
                }
            }
        }

        return NextResponse.json({ status: "ok" });
    } catch (error) {
        console.error("[Webhook Efí] Erro geral:", error);
        // Retornamos 200 para o Efí não ficar tentando reenviar se for erro de processamento nosso, 
        // a menos que queiramos o retry. Efí espera status 200.
        return NextResponse.json({ status: "ok" });
    }
}

/**
 * GET para verificação do webhook (alguns sistemas fazem um handshake inicial)
 */
export async function GET() {
    return NextResponse.json({ status: "ok" });
}
