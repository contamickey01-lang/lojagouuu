import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkGouPayOrderStatus } from "@/lib/goupay";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (url && serviceKey) {
        return createClient(url, serviceKey);
    }
    return null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
        return NextResponse.json({ error: "paymentId é obrigatório" }, { status: 400 });
    }

    try {
        const supabase = getSupabaseAdmin();
        if (!supabase) {
            throw new Error("Supabase não configurado");
        }

        // 1. Buscar pedido localmente
        console.log(`[Order Status] Buscando status para payment_id: ${paymentId}`);
        const { data, error } = await supabase
            .from("orders")
            .select("*")
            .eq("payment_id", String(paymentId))
            .maybeSingle();

        if (error || !data) {
            console.log(`[Order Status] Pedido ${paymentId} não encontrado no banco.`);
            return NextResponse.json({ status: "pending", message: "Pedido não encontrado" });
        }

        console.log(`[Order Status] Pedido ${paymentId} encontrado. Status local: ${data.status}`);

        // 2. Se estiver pendente, fazemos uma consulta direta na API da GouPay (fallback do webhook)
        if (data.status === "pending") {
            console.log(`[Order Status] Pedido ${paymentId} pendente no banco. Consultando API GouPay...`);
            const goupayStatus = await checkGouPayOrderStatus(String(paymentId));

            if (goupayStatus) {
                console.log(`[Order Status] GouPay retornou dados para ID ${paymentId}: status=${goupayStatus.status}`);

                const isPaid = ['paid', 'completed', 'success', 'approved', 'pago', 'concluido'].includes(String(goupayStatus.status).toLowerCase());

                if (isPaid) {
                    console.log(`[Order Status] Atualizando pedido ${data.id} para PAGO via consulta direta (ID GouPay: ${paymentId})`);

                    // Atualiza banco de dados
                    const { error: finalUpdateError } = await supabase
                        .from("orders")
                        .update({
                            status: "paid",
                            payment_status: "concluido",
                            paid_at: new Date().toISOString(),
                        })
                        .eq("id", data.id);

                    if (finalUpdateError) {
                        console.error("[Order Status] Erro ao atualizar status final:", finalUpdateError);
                    }

                    // Também tenta atualizar estoque
                    if (data.items && Array.isArray(data.items)) {
                        console.log(`[Order Status] Processando baixa de estoque para ${data.items.length} itens...`);
                        for (const item of data.items) {
                            try {
                                await supabase.rpc("decrement_stock", {
                                    product_id: item.id,
                                    quantity: item.quantity,
                                });
                            } catch (e) {
                                console.error(`[Order Status] Erro ao baixar estoque do item ${item.id}:`, e);
                            }
                        }
                    }

                    return NextResponse.json({
                        status: "paid",
                        payment_status: "concluido",
                        source: "manual_check"
                    });
                } else {
                    console.log(`[Order Status] Transação ${paymentId} ainda está como: ${goupayStatus.status}`);
                }
            } else {
                console.warn(`[Order Status] API GouPay não retornou dados válidos para o ID: ${paymentId}`);
            }
        }

        // Retornar o status simplificado para o frontend
        return NextResponse.json({
            status: data.status,
            payment_status: data.payment_status
        });

    } catch (error) {
        console.error("[Order Status] Erro:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}

