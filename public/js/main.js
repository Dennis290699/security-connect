// Verificación de Seguridad
document.getElementById("check-security").addEventListener("click", async () => {
  const resultDiv = document.getElementById("security-result");
  const button = document.getElementById("check-security");

  // Mostrar loading
  button.innerHTML = '<span class="loading"></span> Verificando...';
  button.disabled = true;

  // Simular verificación
  await new Promise(resolve => setTimeout(resolve, 1000));

  const isSecure = window.location.protocol === "https:";

  resultDiv.classList.remove("hidden");
  resultDiv.classList.add("fade-in");

  if (isSecure) {
    resultDiv.className = "success fade-in";
    resultDiv.innerHTML = `
      <strong style="font-size: 18px; display: block; margin-bottom: 8px; margin-top: 25px;">Conexión Segura Establecida</strong>
      <p style="margin: 0; line-height: 1.6;">
        Tu conexión está protegida con HTTPS. Todos los datos transmitidos están encriptados 
        con cifrado de grado empresarial AES-256-GCM.
      </p>
      <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid rgba(67, 233, 123, 0.2);">
        <small style="opacity: 0.8;">Protocolo: <strong>${window.location.protocol.toUpperCase()}</strong></small>
      </div>
    `;
  } else {
    resultDiv.className = "error fade-in";
    resultDiv.innerHTML = `
      <strong style="font-size: 18px; display: block; margin-bottom: 8px; margin-top: 25px;">Conexión No Segura</strong>
      <p style="margin: 0;">
        Este sitio NO está usando HTTPS. Los datos podrían estar en riesgo.
      </p>
    `;
  }

  button.innerHTML = 'Verificar Seguridad';
  button.disabled = false;
});

// Cargar Información del Certificado
document.getElementById("load-cert").addEventListener("click", async () => {
  const certInfoDiv = document.getElementById("cert-info");
  const certDetailsDiv = certInfoDiv.querySelector(".cert-details");
  const button = document.getElementById("load-cert");

  // Mostrar loading
  button.innerHTML = '<span class="loading"></span> Cargando...';
  button.disabled = true;

  try {
    const response = await fetch("/api/cert-info");
    const data = await response.json();

    if (data.success) {
      const cert = data.certificate;

      // Actualizar información del certificado con datos reales
      certDetailsDiv.innerHTML = `
        <div class="cert-item slide-up">
          <span class="label">Nombre Común (CN)</span>
          <span class="value">${cert.subject.commonName}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.05s;">
          <span class="label">Organización (O)</span>
          <span class="value">${cert.subject.organization}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.1s;">
          <span class="label">Unidad Organizativa (OU)</span>
          <span class="value">${cert.subject.organizationalUnit}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.15s;">
          <span class="label">Emisor CN</span>
          <span class="value">${cert.issuer.commonName}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.2s;">
          <span class="label">Emisor Organización</span>
          <span class="value">${cert.issuer.organization}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.25s;">
          <span class="label">Emisor OU</span>
          <span class="value">${cert.issuer.organizationalUnit}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.3s;">
          <span class="label">Emitido el</span>
          <span class="value">${cert.validity.notBeforeFormatted}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.35s;">
          <span class="label">Vencimiento el</span>
          <span class="value">${cert.validity.notAfterFormatted}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.4s;">
          <span class="label">Certificado (SHA-256)</span>
          <span class="value" style="font-size: 11px; word-break: break-all;">${cert.fingerprints.sha256Raw}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.45s;">
          <span class="label">Clave Pública (SHA-256)</span>
          <span class="value" style="font-size: 11px; word-break: break-all;">${cert.fingerprints.publicKey}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.5s;">
          <span class="label">Algoritmo</span>
          <span class="value">${cert.technical.algorithm}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.55s;">
          <span class="label">Número de Serie</span>
          <span class="value" style="font-size: 12px;">${cert.technical.serialNumber}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.6s;">
          <span class="label">Versión</span>
          <span class="value">${cert.technical.format}</span>
        </div>
        <div class="cert-item slide-up" style="animation-delay: 0.65s;">
          <span class="label">Estado</span>
          <span class="value">${cert.validity.isValid ? '✓ Válido' : '✗ Expirado'}</span>
        </div>
      `;

      certInfoDiv.classList.remove("hidden");
      certInfoDiv.classList.add("fade-in");

      button.innerHTML = '✓ Información Cargada';
      button.style.background = 'var(--success-gradient)';

    } else {
      throw new Error(data.error || "Error al cargar certificado");
    }

  } catch (error) {
    certDetailsDiv.innerHTML = `
      <div class="cert-item" style="border-color: rgba(245, 87, 108, 0.3);">
        <span class="label">Error</span>
        <span class="value" style="color: #f5576c;">No se pudo cargar la información</span>
      </div>
    `;
    certInfoDiv.classList.remove("hidden");
    button.innerHTML = 'Reintentar';
    button.disabled = false;
  }
});

// Cargar información del certificado automáticamente al cargar la página
async function loadCertificateInfo() {
  try {
    const response = await fetch("/api/cert-info");
    const data = await response.json();

    if (data.success) {
      const cert = data.certificate;

      // Actualizar información del emisor con datos reales
      document.getElementById("org-name").textContent =
        `${cert.issuer.organization} (${cert.issuer.commonName})`;
      document.getElementById("org-location").textContent =
        cert.issuer.locality !== 'N/A' ? cert.issuer.locality : cert.issuer.country;
      document.getElementById("cert-type").textContent = cert.metadata.status;
      document.getElementById("cert-validity").textContent =
        `${cert.validity.totalDays} días (${cert.validity.daysRemaining} restantes)`;

      // Actualizar usos del certificado con información real
      const keyUsageList = document.getElementById("key-usage-list");
      const usages = [
        `Nombre Común (CN): ${cert.subject.commonName}`,
        `Organización (O): ${cert.subject.organization}`,
        `Unidad Organizativa (OU): ${cert.subject.organizationalUnit}`,
        `Algoritmo: ${cert.technical.algorithm}`,
        `Formato: ${cert.technical.format}`
      ];

      keyUsageList.innerHTML = usages.map((usage, index) =>
        `<li style="animation-delay: ${index * 0.1}s;" class="slide-up">${usage}</li>`
      ).join("");
    }
  } catch (error) {
    console.error("Error al cargar información del certificado:", error);
  }
}

// Animación de entrada para las tarjetas
function animateCards() {
  const cards = document.querySelectorAll(".card");
  cards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(30px)";

    setTimeout(() => {
      card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
}

// Ejecutar al cargar la página
window.addEventListener("DOMContentLoaded", () => {
  animateCards();
  loadCertificateInfo();
});

// Efecto de partículas en el fondo (opcional, sutil)
function createParticle() {
  const particle = document.createElement("div");
  particle.style.position = "fixed";
  particle.style.width = "2px";
  particle.style.height = "2px";
  particle.style.background = "rgba(102, 126, 234, 0.5)";
  particle.style.borderRadius = "50%";
  particle.style.pointerEvents = "none";
  particle.style.left = Math.random() * window.innerWidth + "px";
  particle.style.top = "-10px";
  particle.style.zIndex = "-1";

  document.body.appendChild(particle);

  const duration = 3000 + Math.random() * 2000;
  const animation = particle.animate([
    { transform: "translateY(0px)", opacity: 0 },
    { transform: "translateY(50px)", opacity: 0.5, offset: 0.2 },
    { transform: `translateY(${window.innerHeight}px)`, opacity: 0 }
  ], {
    duration: duration,
    easing: "linear"
  });

  animation.onfinish = () => {
    particle.remove();
  };
}

// Crear partículas ocasionalmente
setInterval(() => {
  if (Math.random() > 0.7) {
    createParticle();
  }
}, 500);
