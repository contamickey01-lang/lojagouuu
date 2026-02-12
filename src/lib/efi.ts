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

/**
 * Helper to make HTTPS requests with certificate (mTLS)
 * Since global fetch in Node 18+ doesn't support the agent property correctly.
 */
function httpsRequest(url: string, options: any, body?: any): Promise<any> {
    return new Promise((resolve, reject) => {
        const urlObj = new URL(url);
        const p12Buffer = CERT_BASE64 ? Buffer.from(CERT_BASE64, "base64") : null;

        const requestOptions: https.RequestOptions = {
            hostname: urlObj.hostname,
            path: urlObj.pathname + urlObj.search,
            method: options.method || "GET",
            headers: options.headers || {},
        };

        // Add certificate if it's a PIX request (using PIX_BASE_URL)
        if (url.includes("efipay.com.br") && p12Buffer) {
            requestOptions.pfx = p12Buffer;
            requestOptions.passphrase = "";
            // @ts-ignore
            requestOptions.rejectUnauthorized = false; // Prevents issues with Efi's root CA in some environments
        }

        const req = https.request(requestOptions, (res) => {
            let data = "";
            res.on("data", (chunk) => (data += chunk));
            res.on("end", () => {
                try {
                    const parsed = JSON.parse(data);
                    if (res.statusCode && res.statusCode >= 400) {
                        reject({ status: res.statusCode, data: parsed });
                    } else {
                        resolve(parsed);
                    }
                } catch (e) {
                    if (res.statusCode && res.statusCode >= 400) {
                        reject({ status: res.statusCode, data });
                    } else {
                        resolve(data);
                    }
                }
            });
        });

        req.on("error", (e) => reject(e));

        if (body) {
            req.write(typeof body === "string" ? body : JSON.stringify(body));
        }
        req.end();
    });
}

/**
 * Get OAuth2 Token for PIX
 */
async function getPixToken(): Promise<string> {
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");

    try {
        const data = await httpsRequest(`${PIX_BASE_URL}/oauth/token`, {
            method: "POST",
            headers: {
                "Authorization": `Basic ${auth}`,
                "Content-Type": "application/json"
            }
        }, { grant_type: "client_credentials" });

        return data.access_token;
    } catch (error: any) {
        console.error("[Efí PIX Auth Error]", error);
        throw new Error(`Erro na autenticação Efí PIX: ${error.data?.error_description || error.message || "Erro desconhecido"}`);
    }
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

    return data.access_token;
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
            original: amount.toFixed(1) === amount.toFixed(2) ? amount.toFixed(2) : amount.toFixed(2)
        },
        chave: PAYHUB_KEY,
        solicitacaoPagador: "Compra na Lojagouuu"
    };

    // Ensure amount has 2 decimal places
    body.valor.original = amount.toFixed(2);

    try {
        const data = await httpsRequest(`${PIX_BASE_URL}/v2/cob`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        }, body);

        // Gerar QR Code para este recebimento
        const qrcodeData = await httpsRequest(`${PIX_BASE_URL}/v2/loc/${data.loc.id}/qrcode`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        return {
            id: data.txid,
            status: data.status,
            qr_code: qrcodeData.qrcode,
            qr_code_base64: qrcodeData.imagemQrcode
        };
    } catch (error: any) {
        console.error("[Efí PIX Create Error]", error);
        throw new Error(`Erro ao criar PIX: ${JSON.stringify(error.data || error.message)}`);
    }
}

/**
 * Create Credit Card Payment (Simplified example)
 */
export async function createCardPayment(orderData: any) {
    const token = await getApiToken();

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
