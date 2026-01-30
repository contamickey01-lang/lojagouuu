import { NextRequest, NextResponse } from "next/server";
import { MercadoPagoConfig, Preference } from "mercadopago";

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
}

export async function POST(request: NextRequest) {
    try {
        const body: CheckoutRequest = await request.json();
        const { items, userEmail, userId } = body;

        if (!items || items.length === 0) {
            return NextResponse.json(
                { error: "Carrinho vazio" },
                { status: 400 }
            );
        }

        if (!process.env.MERCADOPAGO_ACCESS_TOKEN) {
            return NextResponse.json(
                { error: "Mercado Pago não configurado" },
                { status: 500 }
            );
        }

        // Preparar itens para o Mercado Pago
        const preferenceItems = items.map((item) => ({
            id: String(item.id),
            title: item.name,
            quantity: item.quantity,
            unit_price: item.price,
            currency_id: "BRL",
            picture_url: item.imageUrl,
        }));

        // Calcular total
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

        // Criar preferência de pagamento
        const preference = new Preference(client);

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://lojagouuu-61dm.vercel.app";

        const result = await preference.create({
            body: {
                items: preferenceItems,
                payer: {
                    email: userEmail,
                },
                back_urls: {
                    success: `${siteUrl}/pedido/sucesso`,
                    failure: `${siteUrl}/pedido/falha`,
                    pending: `${siteUrl}/pedido/pendente`,
                },
                auto_return: "approved",
                external_reference: JSON.stringify({
                    userId,
                    userEmail,
                    items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
                    total,
                    createdAt: new Date().toISOString(),
                }),
                notification_url: `${siteUrl}/api/webhook/mercadopago`,
                statement_descriptor: "GOURP KEYS",
            },
        });

        return NextResponse.json({
            id: result.id,
            init_point: result.init_point,
            sandbox_init_point: result.sandbox_init_point,
        });
    } catch (error) {
        console.error("[Checkout] Erro:", error);
        return NextResponse.json(
            { error: "Erro ao criar checkout" },
            { status: 500 }
        );
    }
}
