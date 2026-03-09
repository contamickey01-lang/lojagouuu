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

/**
 * Helper to search recursively for anything that looks like a Pagar.me ID (or_...)
 */
function findPagarmeIdInObject(obj: any): string | null {
    if (!obj || typeof obj !== 'object') return null;

    // Check all keys
    for (const key in obj) {
        const value = obj[key];
        if (typeof value === 'string' && value.startsWith('or_')) {
            return value;
        }
        if (typeof value === 'object') {
            const found = findPagarmeIdInObject(value);
            if (found) return found;
        }
    }
    return null;
}

export async function createGouPayPixOrder(amount: number, payer: PayerData, description: string = "Compra na Loja Gou") {
    // GouPay expects amount in cents
    const amountInCents = Math.round(amount * 100);

    // Clean CPF (remove non-digits)
    const cleanCpf = payer.cpf.replace(/\D/g, "");

    try {
        const response = await fetch(`${GOUPAY_BASE_URL}/pix`, {
            method: 'POST',
            cache: 'no-store',
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
            console.error("[GouPay API] Erro ao criar Pix:", data);
            throw new Error(`Erro GouPay: ${data.message || 'Erro ao criar Pix'}`);
        }

        const qrCodeText = data.data?.pix_qr_code || data.pix?.qr_code || data.pdu?.qr_code || data.pix_qr_code || data.pdu_qr_code;

        if (!qrCodeText) {
            console.error("[GouPay API] Resposta sem QR Code:", data);
            throw new Error("Resposta da API GouPay não contém código Pix");
        }

        // Tenta encontrar um ID do Pagar.me (or_...) na resposta (caso o gateway responda com ele)
        const pagarmeId = findPagarmeIdInObject(data);

        // Prioridade: transaction_id (Confirmado pelo dono) > Pagarme ID > ID Genérico
        const transitionId = data.transaction_id ||
            data.data?.transaction_id ||
            pagarmeId ||
            data.ID ||
            data.data?.ID ||
            data.id ||
            data.data?.id;

        console.log(`[GouPay API] Pix criado com sucesso. ID Vinculado: ${transitionId}`);

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
    // Lista de URLs para tentar (Redundância caso o gateway tenha formatos variados)
    const urlsToTry = [
        `${GOUPAY_BASE_URL}/pix/${id}`,           // Formato oficial (Path)
        `${GOUPAY_BASE_URL}/pix?id=${id}`,        // Backup (Query)
        `https://www.goupay.com.br/api/pix/${id}` // Sem o /v1/
    ];

    for (const url of urlsToTry) {
        try {
            console.log(`[GouPay Status Check] Tentando URL: ${url}`);
            const response = await fetch(url, {
                method: 'GET',
                cache: 'no-store',
                headers: {
                    'x-api-key': GOUPAY_API_KEY
                }
            });

            const text = await response.text();

            if (text.trim().startsWith('<')) {
                console.log(`[GouPay Status Check] Resposta HTML ignorada para URL: ${url}`);
                continue;
            }

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.log(`[GouPay Status Check] Resposta inválida (não JSON) para URL ${url}:`, text.substring(0, 100));
                continue;
            }

            if (response.ok && data && (data.status || data.data?.status)) {
                const status = data.status || data.data?.status || "pending";
                console.log(`[GouPay Status Check] Sucesso na URL ${url}. Status: ${status}`);
                return {
                    status: String(status).toLowerCase(),
                    raw: data
                };
            } else {
                console.log(`[GouPay Status Check] Resposta negativa ou vazia para ${url}:`, text.substring(0, 100));
            }
        } catch (error) {
            console.error(`[GouPay Status Check] Erro ao tentar URL ${url}:`, error);
        }
    }

    console.error(`[GouPay Status Check] Todas as tentativas falharam para o ID: ${id}`);
    return null;
}
