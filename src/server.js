// src/server.js
import https from "https";
import fs from "fs";
import path from "path";
import app from "./app.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar certificados
const key = fs.readFileSync(path.join(__dirname, "../certs/server.key"));
const cert = fs.readFileSync(path.join(__dirname, "../certs/server.crt"));

const httpsServer = https.createServer({ key, cert }, app);

// Puerto HTTPS
const PORT = 3000;

httpsServer.listen(PORT, () => {
  console.log(`Servidor HTTPS ejecutándose en https://localhost:${PORT}`);
});
