import EfiPay from "sdk-node-apis-efi";
import * as forge from 'node-forge';

/**
 * Efí Bank utility to handle PIX payments
 */

interface EfiAuth {
    certificate: string;
    pemKey?: string;
    cert_base64: boolean;
}

/**
 * Converts a P12 Base64 string into PEM components (Cert and Key)
 */
function convertP12toPem(p12Base64: string): { cert: string; key: string; error?: string } {
    try {
        console.log("[Efí] [DEBUG-V4] Iniciando conversão...");

        // Limpeza: remove espaços e aceita caracteres de Base64 padrão e URL-safe
        const cleanBase64 = p12Base64.trim().replace(/[^A-Za-z0-9+/=_~-]/g, "");

        console.log(`[Efí] [DEBUG-V4] Tamanho do Base64 recebido: ${p12Base64.length}`);
        console.log(`[Efí] [DEBUG-V4] Primeiros 10: ${p12Base64.substring(0, 10)}...`);
        console.log(`[Efí] [DEBUG-V4] Últimos 10: ...${p12Base64.substring(Math.max(0, p12Base64.length - 10))}`);
        console.log(`[Efí] [DEBUG-V4] Tamanho após limpeza: ${cleanBase64.length}`);

        if (cleanBase64.length < 100) {
            return { cert: "", key: "", error: `[DEBUG-V4] Base64 muito curto (${cleanBase64.length} chars).` };
        }

        // Decodificar usando utilitário nativo do forge para maior compatibilidade
        let p12Der;
        try {
            p12Der = forge.util.decode64(cleanBase64);
            console.log(`[Efí] [DEBUG-V4] Tamanho do DER decodificado: ${p12Der.length} bytes`);
        } catch (e: any) {
            return { cert: "", key: "", error: `[DEBUG-V4] Erro na decodificação Base64: ${e.message}` };
        }

        let p12Asn1;
        try {
            p12Asn1 = forge.asn1.fromDer(p12Der);
        } catch (e: any) {
            return { cert: "", key: "", error: `[DEBUG-V4] Erro ao processar estrutura ASN1 (DER): ${e.message}. Isso geralmente indica que o código Base64 está incompleto.` };
        }

        let p12;
        try {
            const password = process.env.EFI_CERT_PASSWORD || '';
            p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);
        } catch (e: any) {
            return { cert: "", key: "", error: `[DEBUG-V4] Senha/Arquivo P12 inválido: ${e.message}` };
        }

        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = certBags[forge.pki.oids.certBag]?.[0];

        if (!certBag || !certBag.cert) {
            return { cert: "", key: "", error: "[DEBUG-V4] Certificado não encontrado no P12." };
        }

        const certPem = forge.pki.certificateToPem(certBag.cert);

        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

        if (!keyBag || !keyBag.key) {
            return { cert: "", key: "", error: "[DEBUG-V4] Chave privada não encontrada no P12." };
        }
        const keyPem = forge.pki.privateKeyToPem(keyBag.key);

        return {
            cert: Buffer.from(certPem).toString('base64'),
            key: Buffer.from(keyPem).toString('base64')
        };
    } catch (error: any) {
        return { cert: "", key: "", error: `[DEBUG-V4] Falha técnica imprevista: ${error.message}` };
    }
}

/**
 * Returns an initialized Efí SDK instance
 */
export function getEfiClient() {
    const certBase64 = process.env.EFI_CERT_BASE64;

    if (!certBase64) {
        throw new Error("Variável EFI_CERT_BASE64 não encontrada no Vercel.");
    }

    const { cert, key, error } = convertP12toPem(certBase64);

    if (error) {
        throw new Error(error);
    }

    const options = {
        sandbox: process.env.EFI_SANDBOX !== "false",
        client_id: process.env.EFI_CLIENT_ID || "",
        client_secret: process.env.EFI_CLIENT_SECRET || "",
        certificate: cert,
        pemKey: key,
        cert_base64: true
    };

    return new EfiPay(options);
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
