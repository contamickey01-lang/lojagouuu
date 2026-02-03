import { MercadoPagoConfig, Payment } from "mercadopago";

/**
 * Mercado Pago utility to handle PIX payments
 */

export function getMercadoPagoClient() {
    const accessToken = process.env.MP_ACCESS_TOKEN;

    if (!accessToken) {
        throw new Error("Variável MP_ACCESS_TOKEN não encontrada.");
    }

    const client = new MercadoPagoConfig({
        accessToken: accessToken,
        options: { timeout: 5000 }
    });

    return new Payment(client);
}
