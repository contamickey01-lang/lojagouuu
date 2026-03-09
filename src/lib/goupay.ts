/**
 * GouPay Pix API integration
 */

const GOUPAY_API_KEY = "gou_live_0a9da2c0520e4eaa80ac7afe8fe36362";
const GOUPAY_BASE_URL = "https://www.goupay.com.br/api/v1";

interface PayerData {
    name: string;
    email: string;
    cpf: string;
}

export async function createGouPayPixOrder(amount: number, payer: PayerData, description: string = "Compra na Loja Gou") {
    // GouPay expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Clean CPF (remove non-digits)
    const cleanCpf = payer.cpf.replace(/\D/g, "");

    try {
        const response = await fetch(`${GOUPAY_BASE_URL}/pix`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': GOUPAY_API_KEY
            },
            body: JSON.stringify({
                amount: amountInCents,
                description: description,
                customer: {
                    name: payer.name,
                    email: payer.email,
                    cpf: cleanCpf
                }
            })
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("[GouPay API Error]", data);
            throw new Error(`Erro GouPay: ${data.message || 'Erro ao criar Pix'}`);
        }

        /**
         * Response format based on user image:
         * {
         *   status: "success",
         *   pix_qr_code: "00020126...", // Pix Copia e Cola
         *   ...
         * }
         */

        // If there's no base64, we'll return a URL to generate a QR code from the text
        const qrCodeText = data.pix_qr_code || data.pdu_qr_code; // Adjust based on actual API response field

        return {
            id: data.transaction_id || data.id || `gou_${Date.now()}`, // Fallback if no ID is returned
            status: "pending",
            qr_code: qrCodeText,
            // Generate a QR code image using a public API
            qr_code_base64: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrCodeText)}`
        };
    } catch (error: any) {
        console.error("[GouPay integration Error]", error);
        throw error;
    }
}
