# 🔐 Generación de Certificados SSL/TLS

## Proyecto Académico — Universidad Central del Ecuador

### Cátedra de Criptografía

Este proyecto forma parte de las prácticas de la **Facultad de Ingeniería – Universidad Central del Ecuador (UCE)** dentro de la **asignatura de Criptografía**, cuyo objetivo es implementar un entorno seguro mediante el uso de **certificados digitales autofirmados**, comprendiendo su estructura, propósito y configuración dentro de un servidor HTTPS desarrollado en **Node.js**.

# 🏫 1. Introducción

En el contexto de la cátedra de Criptografía, es fundamental comprender:

* La creación de certificados digitales
* Su rol en la autenticación y cifrado
* La estructura X.509
* El proceso de firma y generación de claves
* La implementación de HTTPS en aplicaciones web

Para este fin, se generará un certificado utilizando **OpenSSL**, simulando el rol de una Autoridad Certificadora Institucional dentro de un entorno académico.

# 🗂️ 2. Directorio de Certificados

Todos los certificados utilizados por el servidor deben ubicarse en:

```
certs/
├── server.key   ← Clave privada RSA
├── server.crt   ← Certificado digital autofirmado X.509
```

---

# 🛠️ 3. Generación Profesional del Certificado

### Ejecutado desde Git Bash (Windows)

## **Paso 1 — Crear el directorio de certificados**

```bash
mkdir certs
cd certs
```

## **Paso 2 — Generar certificado y clave privada (RSA 2048 bits)**

Este comando genera automáticamente:

* `server.key` → Clave privada
* `server.crt` → Certificado digital autofirmado

```bash
openssl req -x509 -nodes -newkey rsa:2048 -keyout server.key -out server.crt -days 365
```

## **Paso 3 — Llenar la información del certificado**

A continuación, se presenta un conjunto de valores **estandarizados, recomendados y orientados a un entorno académico profesional** de la *Universidad Central del Ecuador*.

Completa los campos así:

```
Country Name (2 letter code) [AU]: EC
State or Province Name (full name) [Some-State]: Pichincha
Locality Name (eg, city) []: Quito
Organization Name (eg, company) [Internet Widgits Pty Ltd]: Universidad Central del Ecuador
Organizational Unit Name (eg, section) []: Facultad de Ingeniería, Escuela de Computación
Common Name (e.g. server FQDN or YOUR name) []: localhost
Email Address []: criptografia@uce.edu.ec
```

### Notas importantes:

* **Common Name (CN)** debe ser **localhost**, ya que se trata de un entorno de desarrollo local.
* Los valores institucionales hacen referencia a la UCE y la cátedra correspondiente.
* No se requiere ingresar una contraseña para la clave privada, ya que se usa `-nodes`.

# 🔎 4. Verificación del Certificado

Puede consultar el contenido del certificado con:

```bash
openssl x509 -in server.crt -text -noout
```

Esto permite visualizar:

* Información del sujeto (UCE)
* Clave pública RSA
* Algoritmo de firma
* Validez (fechas)
* Huellas digitales SHA1/SHA256
* Extensiones X.509

# 🔄 5. Regenerar Certificados

Para generar un nuevo certificado académico:

```bash
cd certs
rm server.key server.crt
openssl req -x509 -nodes -newkey rsa:2048 -keyout server.key -out server.crt -days 365
```

# 🔐 6. Integración con el Servidor HTTPS

El servidor lee automáticamente los certificados desde `certs/`:

```js
const httpsOptions = {
  key: fs.readFileSync('./certs/server.key'),
  cert: fs.readFileSync('./certs/server.crt'),
};
```

Si actualizas los certificados, el **servidor mostrará en la interfaz los nuevos valores** usando:

```js
fetch('/cert-info')
```

---

# 🎓 7. Finalidad Académica

Este procedimiento propone:

* Entender el rol de la criptografía en la seguridad web
* Simular la generación de certificados institucionales
* Estudiar infraestructura de clave pública (PKI)
* Analizar el impacto del cifrado RSA
* Implementar un entorno seguro de pruebas

El certificado generado **NO es válido para producción**, pero es perfecto para fines educativos dentro de la UCE.
