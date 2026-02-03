const fs = require('fs');
const forge = require('node-forge');

const p12Path = 'C:/Users/Gou/Downloads/certificado/efi (1).p12';
const password = ''; // Senha padrão da Efí

try {
    const p12Buffer = fs.readFileSync(p12Path);
    const p12Der = p12Buffer.toString('binary');
    const p12Asn1 = forge.asn1.fromDer(p12Der);
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, password);

    // Extrair Certificado
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const cert = certBags[forge.pki.oids.certBag][0].cert;
    const certPem = forge.pki.certificateToPem(cert);

    // Extrair Chave Privada
    const keyBags = p12.getBags({ bagType: forge.pki.oids.pkcs8ShroudedKeyBag });
    const key = keyBags[forge.pki.oids.pkcs8ShroudedKeyBag][0].key;
    const keyPem = forge.pki.privateKeyToPem(key);

    console.log("--- CERT PEM ---");
    console.log(certPem);
    console.log("--- KEY PEM ---");
    console.log(keyPem);
    console.log("--- END ---");

} catch (e) {
    console.error("Error: " + e.message);
    if (e.message.includes("MAC could not be verified")) {
        console.error("A senha está incorreta ou o arquivo está corrompido.");
    }
}
