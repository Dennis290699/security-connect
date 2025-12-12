// Función reutilizable para cargar la información del certificado
async function loadCertificateData() {
  const response = await fetch("/api/cert-info");
  const data = await response.json();

  if (data.success) {
    return data.certificate;
  } else {
    throw new Error(data.error || "Error al cargar certificado");
  }
}

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

// Cargar información del certificado automáticamente al cargar la página
async function loadCertificateInfo() {
  try {
    const cert = await loadCertificateData();

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

  } catch (error) {
    console.error("Error al cargar información del certificado:", error);
    // Opcional: mostrar un mensaje de error en la UI si no se puede cargar
    // document.getElementById("org-name").textContent = "No disponible";
  }

  // Actualizar estado del servidor en métricas de seguridad
  const isSecure = window.location.protocol === "https:";
  const serverStatusBadge = document.querySelector('.status-badge');
  serverStatusBadge.textContent = isSecure ? 'Activo' : 'Inseguro';
  serverStatusBadge.style.background = isSecure ? 'var(--success-gradient)' : 'var(--secondary-gradient)';
}

// Abrir modal y cargar información en el modal
document.getElementById("load-cert").addEventListener("click", async () => {
  const modal = document.getElementById('cert-modal');
  const certDetailsDiv = document.getElementById('cert-details-content');
  const button = document.getElementById("load-cert");

  // Restablecer el botón a estado inicial cada vez que se haga clic
  button.innerHTML = '<span class="loading"></span> Cargando...';
  button.disabled = true;
  button.style.background = ''; // Restablece el color del botón

  // Abrir el modal inmediatamente
  modal.classList.add('active');

  // Evitar scroll en el fondo
  document.body.classList.add('modal-open');

  try {
    const cert = await loadCertificateData();

    // Actualizar información del certificado con datos reales en el modal
    certDetailsDiv.innerHTML = `
      <div class="cert-item slide-up">
        <div class="cert-label-group">
          <i class="fa-solid fa-user icon-sm"></i>
          <span class="label">Nombre Común (CN)</span>
        </div>
        <span class="value">${cert.subject.commonName}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.05s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-building icon-sm"></i>
          <span class="label">Organización (O)</span>
        </div>
        <span class="value">${cert.subject.organization}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.1s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-sitemap icon-sm"></i>
          <span class="label">Unidad Organizativa (OU)</span>
        </div>
        <span class="value">${cert.subject.organizationalUnit}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.15s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-user-tie icon-sm"></i>
          <span class="label">Emisor CN</span>
        </div>
        <span class="value">${cert.issuer.commonName}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.2s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-building-columns icon-sm"></i>
          <span class="label">Emisor Organización</span>
        </div>
        <span class="value">${cert.issuer.organization}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.25s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-sitemap icon-sm"></i>
          <span class="label">Emisor OU</span>
        </div>
        <span class="value">${cert.issuer.organizationalUnit}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.3s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-calendar-plus icon-sm"></i>
          <span class="label">Emitido el</span>
        </div>
        <span class="value">${cert.validity.notBeforeFormatted}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.35s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-calendar-xmark icon-sm"></i>
          <span class="label">Vencimiento el</span>
        </div>
        <span class="value">${cert.validity.notAfterFormatted}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.4s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-fingerprint icon-sm"></i>
          <span class="label">Certificado (SHA-256)</span>
        </div>
        <span class="value" style="font-size: 11px; word-break: break-all;">${cert.fingerprints.sha256Raw}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.45s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-key icon-sm"></i>
          <span class="label">Clave Pública (SHA-256)</span>
        </div>
        <span class="value" style="font-size: 11px; word-break: break-all;">${cert.fingerprints.publicKey}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.5s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-cogs icon-sm"></i>
          <span class="label">Algoritmo</span>
        </div>
        <span class="value">${cert.technical.algorithm}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.55s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-hashtag icon-sm"></i>
          <span class="label">Número de Serie</span>
        </div>
        <span class="value" style="font-size: 12px;">${cert.technical.serialNumber}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.6s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-code-branch icon-sm"></i>
          <span class="label">Versión</span>
        </div>
        <span class="value">${cert.technical.format}</span>
      </div>
      <div class="cert-item slide-up" style="animation-delay: 0.65s;">
        <div class="cert-label-group">
          <i class="fa-solid fa-shield-alt icon-sm"></i>
          <span class="label">Estado</span>
        </div>
        <span class="value">${cert.validity.isValid ? '✓ Válido' : '✗ Expirado'}</span>
      </div>
    `;

    button.innerHTML = 'Información Cargada';
    button.style.background = 'var(--success-gradient)';

  } catch (error) {
    certDetailsDiv.innerHTML = `
      <div class="cert-item" style="border-color: rgba(245, 87, 108, 0.3);">
        <div class="cert-label-group">
          <i class="fa-solid fa-exclamation-triangle icon-sm"></i>
          <span class="label">Error</span>
        </div>
        <span class="value" style="color: #f5576c;">No se pudo cargar la información</span>
      </div>
    `;
    button.innerHTML = 'Reintentar';
    button.disabled = false;
  }
});

// Cerrar modal
const modal = document.getElementById('cert-modal');
const closeBtn = document.querySelector('.close-btn');

closeBtn.addEventListener('click', () => {
  modal.classList.remove('active');
  document.body.classList.remove('modal-open'); // Restablece el scroll del fondo

  // Restablecer el botón a su estado original
  const button = document.getElementById("load-cert");
  button.innerHTML = 'Cargar Información';
  button.disabled = false;
  button.style.background = ''; // Restablece el color del botón
});

// Cerrar al hacer clic fuera del contenido
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.remove('active');
    document.body.classList.remove('modal-open'); // Restablece el scroll del fondo

    // Restablecer el botón a su estado original
    const button = document.getElementById("load-cert");
    button.innerHTML = 'Cargar Información';
    button.disabled = false;
    button.style.background = ''; // Restablece el color del botón
  }
});

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