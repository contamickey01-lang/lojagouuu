import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (url && serviceKey) return createClient(url, serviceKey);
    return null;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get("paymentId");

    if (!paymentId) {
        return NextResponse.json({ error: "Faltando ID do pagamento" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
        return NextResponse.json({ error: "Erro de configuração" }, { status: 500 });
    }

    try {
        const { data, error } = await supabase
            .from("orders")
            .select("status")
            .eq("payment_id", paymentId)
            .single();

        if (error) {
            // Se não achar o pedido, pode ser que o webhook ainda não tenha rodado
            console.log("[Status Check] Pedido não encontrado ainda:", paymentId);
            return NextResponse.json({ status: "pending" });
        }

        return NextResponse.json({ status: data.status });
    } catch (err) {
        console.error("[Status Check] Erro:", err);
        return NextResponse.json({ status: "pending" });
    }
}
