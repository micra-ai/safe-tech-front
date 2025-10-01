// ========= API base =========
const API_URL = import.meta.env.VITE_API_URL || "https://techsyncore.duckdns.org";
export default API_URL;   // 👈 export default para usar en Camaras.jsx

console.log("🚀 API_URL en runtime:", API_URL);

// ========= Helper para fetch =========
async function fetchJSON(path, opts = {}) {
  console.log("👉 Llamando a:", `${API_URL}${path}`);
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });

  // Leer respuesta como texto para debug
  const text = await res.text();
  console.log("🔵 Body recibido:", text);

  try {
    return JSON.parse(text);
  } catch {
    console.error("❌ No es JSON válido");
    throw new Error(text);
  }
}

// ========= Métricas =========
export async function getDashboardMetrics() {
  return fetchJSON("/dashboard/metrics");
}

export async function getDashboardTrend() {
  return fetchJSON("/dashboard/trend");
}

export async function reiniciarMetricas() {
  return fetchJSON("/dashboard/reset", { method: "POST" });
}

// ========= Estado detección =========
export const getEstadoDeteccion = () => fetchJSON("/deteccion/estado");

export const setEstadoDeteccion = (activo) =>
  fetchJSON("/deteccion/estado", {
    method: "POST",
    body: JSON.stringify({ activo }),
    headers: { "Content-Type": "application/json" },
  });

// ========= Timelapse =========
export const getTimelapseDias = () => fetchJSON("/timelapse/dias");

export async function getTimelapse(dia, canal) {
  if (!dia) return [];
  const q = new URLSearchParams({ dia });
  if (canal) q.set("canal", canal);
  return fetchJSON(`/timelapse?${q.toString()}`);
}

export async function getTimelapseDetecciones(dia, canal) {
  if (!dia || !canal) return [];
  const q = new URLSearchParams({ dia, canal });
  return fetchJSON(`/timelapse_detecciones?${q.toString()}`);
}

export async function getTimelapseDeteccionesDias(canal) {
  const q = new URLSearchParams(canal ? { canal } : {});
  return fetchJSON(`/timelapse_detecciones/dias?${q.toString()}`);
}

// ========= Reportes =========
export const getFechasDisponibles = () => fetchJSON("/fechas-disponibles");
export const getReportesAlertas   = () => fetchJSON("/reportes-alertas");

// ========= Videos =========
export const subirYDetectarVideo = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API_URL}/detectar/video`, {
    method: "POST",
    body: fd,
  });
  return res.json();
};

export const listarVideos = () => fetchJSON("/videos");

// ========= Auth =========
export const registerUser = (data) =>
  fetchJSON("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

export const loginUser = (data) =>
  fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { "Content-Type": "application/json" },
  });

export const getCurrentUser = () => fetchJSON("/auth/me");
export const logoutUser     = () => fetchJSON("/auth/logout", { method: "POST" });

// ========= Gestión de usuarios (solo admin) =========
export const getUsuarios = () => fetchJSON("/usuarios");
export const deleteUsuario = (id) =>
  fetchJSON(`/usuarios/${id}`, { method: "DELETE" });



















