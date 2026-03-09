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

        console.log("[GouPay API] Resposta de criação completa:", JSON.stringify(data, null, 2));

        /**
         * Response format can vary:
         * data.pix.qr_code
         * data.pdu.qr_code
         */

        const qrCodeText = data.data?.pix_qr_code || data.pix?.qr_code || data.pdu?.qr_code || data.pix_qr_code || data.pdu_qr_code;

        if (!qrCodeText) {
            console.error("[GouPay API] Resposta sem QR Code:", data);
            throw new Error("Resposta da API GouPay não contém código Pix");
        }

        // The ID should be consistent with what the webhook sends (data.ID in docs)
        const transitionId = data.data?.ID || data.ID || data.transaction_id || data.id || data.pix?.id || data.pdu?.id;

        console.log(`[GouPay API] ID de transação identificado para salvar: ${transitionId}`);

        return {
            id: transitionId || `gou_${Date.now()}`,
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

/**
 * Consulta status de um Pix na GouPay
 */
export async function checkGouPayOrderStatus(id: string) {
    try {
        console.log(`[GouPay Status Check] Consultando ID: ${id}`);
        const response = await fetch(`${GOUPAY_BASE_URL}/pix/${id}`, {
            method: 'GET',
            headers: {
                'x-api-key': GOUPAY_API_KEY
            }
        });

        const text = await response.text();

        // Se a resposta começar com <, ainda é HTML (erro no gateway)
        if (text.trim().startsWith('<')) {
            console.error(`[GouPay Status Check] Recebeu HTML. O gateway ainda pode estar com erro no endpoint /api/v1/pix/${id}`);
            return null;
        }

        let data;
        try {
            data = JSON.parse(text);
        } catch (e) {
            console.error("[GouPay Status Check] Resposta inválida (não JSON):", text.substring(0, 100));
            return null;
        }

        if (!response.ok) {
            console.error("[GouPay Status Check Error]", data);
            return null;
        }

        // De acordo com o dono da GouPay: status pode ser "paid", "pending", etc.
        const status = data.status || data.data?.status || "pending";
        console.log(`[GouPay Status Check] Status da transação: ${status}`);

        return {
            status: String(status).toLowerCase(),
            raw: data
        };
    } catch (error) {
        console.error("[GouPay Status Check failed]", error);
        return null;
    }
}

