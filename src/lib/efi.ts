import https from "https";

const EFI_SANDBOX = process.env.EFI_SANDBOX === "true";
const CLIENT_ID = process.env.EFI_CLIENT_ID;
const CLIENT_SECRET = process.env.EFI_CLIENT_SECRET;
const PAYHUB_KEY = process.env.EFI_PAYHUB_KEY;
const CERT_BASE64 = process.env.EFI_CERT_BASE64;

const API_BASE_URL = EFI_SANDBOX
    ? "https://sandbox.gerencianet.com.br"
    : "https://api.gerencianet.com.br";

const PIX_BASE_URL = EFI_SANDBOX
    ? "https://pix-h.api.efipay.com.br"
    : "https://pix.api.efipay.com.br";

interface EfiTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    scope: string;
}

/**
 * Get HTTPS Agent for PIX mTLS
 */
function getPixAgent() {
    if (!CERT_BASE64) {
        throw new Error("EFI_CERT_BASE64 não configurado.");
    }

    const p12Buffer = Buffer.from(CERT_BASE64, "base64");

    return new https.Agent({
        pfx: p12Buffer,
        passphrase: "", // Geralmente vazio para certificados Efí convertidos
        rejectUnauthorized: false // Em alguns ambientes locais/Vercel pode ser necessário
    });
}

/**
 * Get OAuth2 Token for PIX
 */
async function getPixToken(): Promise<string> {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const response = await fetch(`${PIX_BASE_URL}/oauth/token`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ grant_type: "client_credentials" }),
        // @ts-ignore - Next.js/Node fetch supports agent
        agent: getPixAgent()
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("[Efí PIX Auth Error]", data);
        throw new Error(`Erro na autenticação Efí PIX: ${data.error_description || data.error || "Erro desconhecido"}`);
    }

    return (data as EfiTokenResponse).access_token;
}

/**
 * Get OAuth2 Token for Credit Card (API V1)
 */
async function getApiToken(): Promise<string> {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    const response = await fetch(`${API_BASE_URL}/v1/authorize`, {
        method: "POST",
        headers: {
            "Authorization": `Basic ${auth}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ grant_type: "client_credentials" })
    });

    const data = await response.json();
    if (!response.ok) {
        console.error("[Efí API Auth Error]", data);
        throw new Error("Erro na autenticação Efí API.");
    }

    return (data as EfiTokenResponse).access_token;
}

/**
 * Create PIX Order
 */
export async function createPixOrder(amount: number, payer: { name: string, cpf: string }) {
    const token = await getPixToken();
    const cleanCpf = payer.cpf.replace(/\D/g, "");

    const body = {
        calendario: {
            expiracao: 3600 // 1 hora
        },
        devedor: {
            cpf: cleanCpf,
            nome: payer.name
        },
        valor: {
            original: amount.toFixed(2)
        },
        chave: PAYHUB_KEY,
        solicitacaoPagador: "Compra na Lojagouuu"
    };

    const response = await fetch(`${PIX_BASE_URL}/v2/cob`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(body),
        // @ts-ignore
        agent: getPixAgent()
    });

    const data = await response.json();
    if (!response.ok) {
        throw new Error(`Erro ao criar PIX: ${JSON.stringify(data)}`);
    }

    // Gerar QR Code para este recebimento
    const qrcodeResponse = await fetch(`${PIX_BASE_URL}/v2/loc/${data.loc.id}/qrcode`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        },
        // @ts-ignore
        agent: getPixAgent()
    });

    const qrcodeData = await qrcodeResponse.json();

    return {
        id: data.txid,
        status: data.status,
        qr_code: qrcodeData.qrcode,
        qr_code_base64: qrcodeData.imagemQrcode
    };
}

/**
 * Create Credit Card Payment (Simplified example)
 */
export async function createCardPayment(orderData: any) {
    const token = await getApiToken();

    // Note: Efí requires a payment token generated on frontend for security
    // This part involves more steps (metadata, items, payment data)
    // For now, let's keep it structured for when we add the frontend part

    const response = await fetch(`${API_BASE_URL}/v1/charge`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify(orderData)
    });

    return await response.json();
}
