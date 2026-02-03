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
 * returns base64 encoded PEM strings to be used with Efí SDK.
 */
function convertP12toPem(p12Base64: string): { cert: string; key: string } | null {
    try {
        console.log("[Efí] Iniciando conversão do certificado (P12 -> PEM)...");

        // Remover sujeira do base64
        const cleanBase64 = p12Base64.trim().replace(/\s/g, "").replace(/['"]/g, "");

        // Decodificar base64 para binário nativo do forge
        const p12Der = forge.util.decode64(cleanBase64);
        const p12Asn1 = forge.asn1.fromDer(p12Der);

        // Efí P12 geralmente não tem senha ('')
        const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '');

        // Extrair certificado
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = certBags[forge.pki.oids.certBag]?.[0];

        if (!certBag || !certBag.cert) {
            throw new Error("Certificado não encontrado no P12. Verifique se o arquivo está correto.");
        }

        const cert = certBag.cert;
        const certPem = forge.pki.certificateToPem(cert);

        // Diagnóstico de ambiente (Sandbox vs Produção)
        try {
            const commonName = cert.subject.getField('CN')?.value || 'desconhecido';
            console.log(`[Efí] Certificado identificado para: ${commonName}`);
            if (commonName.toLowerCase().includes('sandbox')) {
                console.log("[Efí] DICA: Este parece ser um certificado de SANDBOX.");
            } else {
                console.log("[Efí] DICA: Este parece ser um certificado de PRODUÇÃO.");
            }
        } catch (e) {
            console.log("[Efí] Não foi possível identificar o ambiente no certificado.");
        }

        // Extrair chave privada
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

        if (!keyBag || !keyBag.key) {
            throw new Error("Chave privada não encontrada no P12. Verifique se o arquivo está completo.");
        }
        const keyPem = forge.pki.privateKeyToPem(keyBag.key);

        console.log("[Efí] Conversão PEM realizada com sucesso.");

        return {
            cert: Buffer.from(certPem).toString('base64'),
            key: Buffer.from(keyPem).toString('base64')
        };
    } catch (error: any) {
        console.error("[Efí] ERRO CRÍTICO NA CONVERSÃO DO CERTIFICADO:", error.message || error);
        return null;
    }
}

/**
 * Returns an initialized Efí SDK instance
 */
export function getEfiClient() {
    const certBase64 = process.env.EFI_CERT_BASE64;

    if (!certBase64) {
        throw new Error("EFI_CERT_BASE64 não encontrada nas variáveis de ambiente.");
    }

    // Converter P12 para PEM em memória para evitar erros de OpenSSL 3 (mac verify failure)
    const pemData = convertP12toPem(certBase64);

    if (!pemData) {
        throw new Error("Falha ao processar certificado. Verifique se o código Base64 está correto.");
    }

    const options = {
        sandbox: process.env.EFI_SANDBOX !== "false",
        client_id: process.env.EFI_CLIENT_ID || "",
        client_secret: process.env.EFI_CLIENT_SECRET || "",
        certificate: pemData.cert,
        pemKey: pemData.key,
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
