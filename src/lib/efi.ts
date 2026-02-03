import EfiPay from "sdk-node-apis-efi";
import fs from "fs";
import path from "path";
import os from "os";

/**
 * Efí Bank utility to handle PIX payments
 */

// Path for the temporary certificate
const CERT_PATH = path.join(os.tmpdir(), "efi-certificate.p12");

/**
 * Ensures the certificate file exists on disk from the Base64 environment variable.
 * Efí SDK requires a physical path to the .p12 file.
 */
function setupCertificate() {
    const certBase64 = process.env.EFI_CERT_BASE64;

    if (!certBase64) {
        console.warn("[Efí] EFI_CERT_BASE64 não encontrada nas variáveis de ambiente.");
        return null;
    }

    try {
        const certBuffer = Buffer.from(certBase64, "base64");
        fs.writeFileSync(CERT_PATH, certBuffer);
        return CERT_PATH;
    } catch (error) {
        console.error("[Efí] Erro ao salvar certificado temporário:", error);
        return null;
    }
}

/**
 * Returns an initialized Efí SDK instance
 */
export function getEfiClient() {
    const certPath = setupCertificate();

    const options = {
        sandbox: process.env.EFI_SANDBOX !== "false", // Default to sandbox true unless explicitly false
        client_id: process.env.EFI_CLIENT_ID || "",
        client_secret: process.env.EFI_CLIENT_SECRET || "",
        certificate: certPath || "",
    };

    return new EfiPay(options);
}

/**
 * Helper to generate a unique txid (must be between 26 and 35 alphanumeric characters)
 * Efí requires this for immediate charges
 */
export function generateTxid() {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let txid = "";
    for (let i = 0; i < 30; i++) {
        txid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return txid;
}
