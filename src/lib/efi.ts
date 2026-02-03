import EfiPay from "sdk-node-apis-efi";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Efí Bank utility to handle PIX payments
 */

/**
 * Returns an initialized Efí SDK instance
 */
export function getEfiClient() {
    const certPem = process.env.EFI_CERT_PEM;
    const keyPem = process.env.EFI_KEY_PEM;
    const certBase64 = process.env.EFI_CERT_BASE64;

    const clientId = process.env.EFI_CLIENT_ID;
    const clientSecret = process.env.EFI_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        throw new Error("[Efí] Credenciais (ID/Secret) não encontradas.");
    }

    const sandboxVar = String(process.env.EFI_SANDBOX || "true").toLowerCase().trim();
    const isSandbox = sandboxVar !== "false";

    console.log(`[Efí] DEBUG: EFI_SANDBOX config: "${process.env.EFI_SANDBOX}" -> Result: ${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'}`);
    console.log(`[Efí] DEBUG: EFI_CERT_PEM present: ${!!certPem}`);
    console.log(`[Efí] DEBUG: EFI_KEY_PEM present: ${!!keyPem}`);

    // Configuração base
    const options: any = {
        sandbox: isSandbox,
        client_id: clientId,
        client_secret: clientSecret,
    };

    // Prioridade 1: PEM Strings (Mais robusto para Vercel)
    if (certPem && keyPem) {
        console.log(`[Efí] Usando certificado em modo PEM (${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'})`);

        // Criar arquivos temporários para o SDK (algumas versões do SDK exigem caminhos de arquivo)
        const certPath = path.join(os.tmpdir(), "efi-cert.pem");
        const keyPath = path.join(os.tmpdir(), "efi-key.pem");

        fs.writeFileSync(certPath, certPem);
        fs.writeFileSync(keyPath, keyPem);

        options.certificate = certPath;
        // Importante: O SDK da Efí usa internamente a chave se estiver no mesmo path ou configurada
        // Verificamos se o SDK aceita pemKey diretamente
        options.pemKey = keyPath;
    }
    // Prioridade 2: P12 Base64 (Legado/Fallback)
    else if (certBase64) {
        console.log(`[Efí] Usando certificado em modo P12 Base64 (${isSandbox ? 'SANDBOX' : 'PRODUÇÃO'})`);
        let cleanBase64 = certBase64.trim();
        if (cleanBase64.includes(",")) cleanBase64 = cleanBase64.split(",")[1];
        cleanBase64 = cleanBase64.replace(/\s/g, "");

        options.certificate = cleanBase64;
        options.cert_base64 = true;
    } else {
        throw new Error("[Efí] Nenhum certificado (PEM ou Base64) encontrado nas variáveis de ambiente.");
    }

    try {
        return new EfiPay(options);
    } catch (error: any) {
        console.error("[Efí] Erro ao inicializar SDK:", error.message);
        throw new Error(`[Efí] Falha: ${error.message}`);
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
