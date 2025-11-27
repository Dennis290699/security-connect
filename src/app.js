// src/app.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const app = express();

// Necesario para __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware para JSON
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, "../public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// Endpoint para obtener información del certificado
app.get("/api/cert-info", async (req, res) => {
  try {
    const certPath = path.join(__dirname, "../certs/server.crt");
    const keyPath = path.join(__dirname, "../certs/server.key");
    const certPem = fs.readFileSync(certPath, "utf8");
    const keyPem = fs.readFileSync(keyPath, "utf8");

    // Importar crypto para parsear el certificado
    const crypto = await import("crypto");

    // Crear objeto X509Certificate
    const cert = new crypto.X509Certificate(certPem);

    // Extraer información del subject y issuer
    const subject = cert.subject;
    const issuer = cert.issuer;

    // Función para parsear DN (Distinguished Name)
    const parseDN = (dn) => {
      const parts = {};
      // El formato es: CN=value\nO=value\nOU=value, etc.
      const lines = dn.split('\n');
      lines.forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          parts[key.trim()] = valueParts.join('=').trim();
        }
      });
      return parts;
    };

    const subjectParts = parseDN(subject);
    const issuerParts = parseDN(issuer);

    // Calcular fingerprint SHA-256
    const certDer = Buffer.from(
      certPem.replace(/-----BEGIN CERTIFICATE-----/, '')
        .replace(/-----END CERTIFICATE-----/, '')
        .replace(/\s/g, ''),
      'base64'
    );
    const fingerprint = crypto.createHash('sha256').update(certDer).digest('hex');
    const fingerprintFormatted = fingerprint.match(/.{2}/g).join(':').toUpperCase();

    // Calcular fingerprint de la clave pública
    const publicKey = cert.publicKey.export({ type: 'spki', format: 'der' });
    const publicKeyFingerprint = crypto.createHash('sha256').update(publicKey).digest('hex');

    // Obtener fechas de validez
    const validFrom = new Date(cert.validFrom);
    const validTo = new Date(cert.validTo);

    // Calcular días de validez
    const now = new Date();
    const daysRemaining = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));
    const totalDays = Math.floor((validTo - validFrom) / (1000 * 60 * 60 * 24));

    // Obtener información de la clave pública
    const publicKeyInfo = cert.publicKey.asymmetricKeyDetails;
    const keySize = publicKeyInfo?.modulusLength || 2048;

    // Formatear fechas en español
    const formatDate = (date) => {
      const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

      const dayName = days[date.getDay()];
      const day = date.getDate();
      const month = months[date.getMonth()];
      const year = date.getFullYear();
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');

      return `${dayName}, ${day} de ${month} de ${year}, ${hours}:${minutes}:${seconds}`;
    };

    const certInfo = {
      // Subject (información del certificado)
      subject: {
        commonName: subjectParts.CN || 'N/A',
        organization: subjectParts.O || 'N/A',
        organizationalUnit: subjectParts.OU || 'N/A',
        locality: subjectParts.L || 'N/A',
        state: subjectParts.ST || 'N/A',
        country: subjectParts.C || 'N/A'
      },

      // Issuer (emisor del certificado)
      issuer: {
        commonName: issuerParts.CN || 'N/A',
        organization: issuerParts.O || 'N/A',
        organizationalUnit: issuerParts.OU || 'N/A',
        locality: issuerParts.L || 'N/A',
        state: issuerParts.ST || 'N/A',
        country: issuerParts.C || 'N/A'
      },

      // Validez
      validity: {
        notBefore: validFrom.toISOString(),
        notAfter: validTo.toISOString(),
        notBeforeFormatted: formatDate(validFrom),
        notAfterFormatted: formatDate(validTo),
        daysRemaining: daysRemaining,
        totalDays: totalDays,
        isValid: now >= validFrom && now <= validTo
      },

      // Fingerprints
      fingerprints: {
        sha256: fingerprintFormatted,
        sha256Raw: fingerprint,
        publicKey: publicKeyFingerprint
      },

      // Información técnica
      technical: {
        version: cert.version || 3,
        serialNumber: cert.serialNumber,
        algorithm: `RSA ${keySize} bits`,
        signatureAlgorithm: cert.signatureAlgorithm || 'sha256WithRSAEncryption',
        keySize: keySize,
        publicKeyAlgorithm: 'RSA',
        format: 'X.509 v3'
      },

      // Información adicional
      metadata: {
        isSelfSigned: subject === issuer,
        status: subject === issuer ? 'Autofirmado' : 'Firmado por CA',
        protocol: 'TLS 1.3',
        cipher: 'AES-256-GCM'
      }
    };

    res.json({
      success: true,
      certificate: certInfo,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error al leer certificado:", error);
    res.status(500).json({
      success: false,
      error: "No se pudo obtener información del certificado",
      message: error.message
    });
  }
});

export default app;
