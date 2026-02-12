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

        // Buscar pedido pelo payment_id (TXID no Efí ou ID no Mercado Pago)
        const { data, error } = await supabase
            .from("orders")
            .select("status, payment_status")
            .eq("payment_id", paymentId)
            .single();

        if (error || !data) {
            return NextResponse.json({ status: "pending", message: "Pedido não encontrado" });
        }

        // Retornar o status simplificado para o frontend
        return NextResponse.json({
            status: data.status, // 'paid', 'pending', etc
            payment_status: data.payment_status
        });

    } catch (error) {
        console.error("[Order Status] Erro:", error);
        return NextResponse.json({ error: "Erro interno" }, { status: 500 });
    }
}
