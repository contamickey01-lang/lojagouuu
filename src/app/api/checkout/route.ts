import { NextRequest, NextResponse } from "next/server";
import { getEfiClient, generateTxid } from "@/lib/efi";
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

        // Configurações Efí
        const efiClientId = process.env.EFI_CLIENT_ID;
        const efiPixKey = process.env.EFI_PIX_KEY;

        if (!efiClientId || !efiPixKey) {
            return NextResponse.json({ error: "Configuração do Efí Bank incompleta" }, { status: 500 });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Limpar CPF
        const cleanCpf = payerCpf.replace(/\D/g, "");

        // Gerar TXID único
        const txid = generateTxid();

        // 1. Criar pedido 'pendente' no Supabase para rastreio
        const supabase = getSupabaseAdmin();
        if (supabase) {
            const { error: orderError } = await supabase
                .from("orders")
                .insert({
                    payment_id: txid, // Usamos o TXID como identificador inicial
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
                console.error("[Checkout Efí] Erro ao salvar pedido pendente:", orderError);
                // Continuamos mesmo se falhar o log, ou paramos? Melhor parar para garantir rastreio.
                return NextResponse.json({ error: "Erro ao registrar pedido." }, { status: 500 });
            }
        }

        // 2. Criar Cobrança Pix no Efí
        const efi = getEfiClient();

        const cobBody = {
            calendario: {
                expiracao: 3600 // 1 hora
            },
            devedor: {
                cpf: cleanCpf,
                nome: payerName
            },
            valor: {
                original: total.toFixed(2)
            },
            chave: efiPixKey,
            solicitacaoPagador: `Compra na GouPay - ${items.length} itens`
        };

        const cobRef = await efi.pixCreateImmediateCharge({ txid }, cobBody);

        if (!cobRef || !cobRef.loc || !cobRef.loc.id) {
            throw new Error("Erro ao criar cobrança no Efí Bank");
        }

        // 3. Gerar QR Code
        const qrcodeRef = await efi.pixGenerateQRCode({ id: cobRef.loc.id });

        // Retornar dados para o frontend
        return NextResponse.json({
            id: txid,
            status: "pending",
            qr_code: qrcodeRef.qrcode,
            qr_code_base64: qrcodeRef.imagemQrcode,
            ticket_url: qrcodeRef.linkVisualizacao || "",
        });

    } catch (error: any) {
        console.error("[Checkout Efí] Erro:", error);

        const errorMessage = error.nome || error.mensagem || error.message || "Erro ao gerar PIX com Efí Bank";

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
