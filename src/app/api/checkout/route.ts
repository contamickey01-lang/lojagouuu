import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Payment } from "mercadopago";

// Configurar Mercado Pago
const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

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

        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            return NextResponse.json({ error: "Mercado Pago não configurado" }, { status: 500 });
        }

        // Calcular total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Criar Pagamento Transparente (PIX)
        const payment = new Payment(client);

        // Limpar CPF (deixar apenas números)
        const cleanCpf = payerCpf.replace(/\D/g, "");

        // Separar nome e sobrenome
        const nameParts = payerName.split(" ");
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(" ") : "Sobrenome";

        const result = await payment.create({
            body: {
                transaction_amount: total,
                description: `Compra na GouRp - ${items.length} itens`,
                payment_method_id: "pix",
                payer: {
                    email: userEmail,
                    first_name: firstName,
                    last_name: lastName,
                    identification: {
                        type: "CPF",
                        number: cleanCpf,
                    },
                },
                external_reference: JSON.stringify({
                    userId,
                    userEmail,
                    items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
                    total,
                    createdAt: new Date().toISOString(),
                }),
                notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhook/mercadopago`,
            },
        });

        // Retornar dados do PIX para o frontend
        return NextResponse.json({
            id: result.id,
            status: result.status,
            qr_code: result.point_of_interaction?.transaction_data?.qr_code,
            qr_code_base64: result.point_of_interaction?.transaction_data?.qr_code_base64,
            ticket_url: result.point_of_interaction?.transaction_data?.ticket_url,
        });
    } catch (error: any) {
        console.error("[Checkout PIX] Erro:", error);

        // Tentar extrair erro detalhado do Mercado Pago
        const mpError = error.cause?.[0]?.description || error.message || "Erro ao gerar PIX";

        return NextResponse.json(
            { error: mpError },
            { status: 500 }
        );
    }
}
