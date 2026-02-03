import EfiPay from "sdk-node-apis-efi";

/**
 * Efí Bank utility to handle PIX payments
 * Updated: Passing P12 Base64 directly to the SDK to avoid ASN1 parsing errors.
 */

/**
 * Returns an initialized Efí SDK instance
 */
export function getEfiClient() {
    const certBase64 = process.env.EFI_CERT_BASE64;
    const clientId = process.env.EFI_CLIENT_ID;
    const clientSecret = process.env.EFI_CLIENT_SECRET;

    if (!certBase64) {
        throw new Error("[Efí] Variável EFI_CERT_BASE64 não encontrada.");
    }

    if (!clientId || !clientSecret) {
        throw new Error("[Efí] Variáveis EFI_CLIENT_ID ou EFI_CLIENT_SECRET não encontradas.");
    }

    // Limpeza básica: remove espaços e prefixos comuns
    let cleanBase64 = certBase64.trim();
    if (cleanBase64.includes(",")) {
        cleanBase64 = cleanBase64.split(",")[1];
    }
    cleanBase64 = cleanBase64.replace(/\s/g, "");

    // O SDK da Efí aceita o P12 em Base64 diretamente se 'cert_base64' for true
    const options = {
        sandbox: process.env.EFI_SANDBOX !== "false",
        client_id: clientId,
        client_secret: clientSecret,
        certificate: cleanBase64,
        cert_base64: true
    };

    try {
        return new EfiPay(options);
    } catch (error: any) {
        console.error("[Efí] Erro ao inicializar SDK:", error.message);
        throw new Error(`[Efí] Erro na inicialização: ${error.message}`);
    }
}

/**
 * Helper to generate a unique txid (must be between 26 and 35 alphanumeric characters)
 */
export function generateTxid() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let txid = "";
    for (let i = 0; i < 30; i++) {
        txid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txid;
}
