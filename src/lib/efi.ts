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
        console.log("[Efí] Iniciando conversão do certificado (P12 -> PEM)...");

        // Limpeza rigorosa: remove tudo que não for caractere Base64 válido
        const cleanBase64 = p12Base64.replace(/[^A-Za-z0-9+/=]/g, "");

        if (cleanBase64.length < 100) {
            return { cert: "", key: "", error: `Base64 muito curto (${cleanBase64.length} chars). Verifique se a variável foi copiada corretamente.` };
        }

        // Decodificar base64 usando Buffer (mais confiável no Node)
        const p12Buffer = Buffer.from(cleanBase64, 'base64');
        const p12Der = p12Buffer.toString('binary');
        const p12Asn1 = forge.asn1.fromDer(p12Der);

        // Tentar abrir o P12 com senha vazia (padrão Efí)
        let p12;
        try {
            p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '');
        } catch (e: any) {
            console.error("[Efí] Erro ao abrir PKCS12:", e.message);
            return { cert: "", key: "", error: `Erro ao abrir P12 (Senha incorreta ou arquivo corrompido). Original: ${e.message}` };
        }

        // Extrair certificado
        const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
        const certBag = certBags[forge.pki.oids.certBag]?.[0];

        if (!certBag || !certBag.cert) {
            return { cert: "", key: "", error: "Certificado não encontrado dentro do arquivo P12." };
        }

        const certPem = forge.pki.certificateToPem(certBag.cert);

        // Identificar ambiente para log
        try {
            const commonName = certBag.cert.subject.getField('CN')?.value || 'desconhecido';
            console.log(`[Efí] Certificado para: ${commonName}`);
        } catch (e) { }

        // Extrair chave privada
        const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
        const keyBag = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag]?.[0];

        if (!keyBag || !keyBag.key) {
            return { cert: "", key: "", error: "Chave privada não encontrada dentro do arquivo P12." };
        }
        const keyPem = forge.pki.privateKeyToPem(keyBag.key);

        console.log("[Efí] Conversão PEM realizada com sucesso.");

        return {
            cert: Buffer.from(certPem).toString('base64'),
            key: Buffer.from(keyPem).toString('base64')
        };
    } catch (error: any) {
        console.error("[Efí] Falha geral na conversão:", error.message);
        return { cert: "", key: "", error: `Falha técnica: ${error.message}` };
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
