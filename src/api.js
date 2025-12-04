// ========= API base =========
// src/api.js

// Si VITE_API_URL no existe, usamos directamente el DuckDNS
const API_URL = "https://techsyncore.duckdns.org";

console.log("API_URL en runtime:", API_URL);

export default API_URL;
// ========= Helper para fetch =========
async function fetchJSON(path, opts = {}) {
  console.log("👉 Llamando a:", `${API_URL}${path}`);

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });

  const text = await res.text();

  // Validaciones anti-error
  // Respuestas inválidas que NO son JSON real
const invalids = ["undefined", "null", "None"];

if (
  !text ||
  text.trim() === "" ||
  text.startsWith("<") ||            // HTML → error del servidor
  invalids.includes(text.trim())     // valores no parseables
) {
  console.warn("⚠ Respuesta no válida desde API:", text);
  return null;
}

  try {
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ JSON inválido:", text);
    return null;
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

// 🔐 LOGIN
export const loginUser = ({ correo, password }) =>
  fetchJSON("/auth/login", {
    method: "POST",
    body: JSON.stringify({
      // Mandamos ambos campos para compatibilidad
      correo,           // 👉 si el backend espera "correo"
      email: correo,    // 👉 si el backend espera "email"
      password,
    }),
    headers: { "Content-Type": "application/json" },
  });

// 🧾 REGISTRO
export const registerUser = ({ nombre, correo, password }) =>
  fetchJSON("/auth/register", {
    method: "POST",
    body: JSON.stringify({
      // Igual: mandamos las dos variantes
      nombre,           // 👉 si el backend espera "nombre"
      name: nombre,     // 👉 si espera "name"
      correo,           // 👉 variante 1
      email: correo,    // 👉 variante 2
      password,
      rol: "user",      // valor por defecto razonable si el backend lo pide
    }),
    headers: { "Content-Type": "application/json" },
  });


export const getCurrentUser = () => fetchJSON("/auth/me");
export const logoutUser     = () => fetchJSON("/auth/logout", { method: "POST" });

// ========= Gestión de usuarios (solo admin) =========
export const getUsuarios = () => fetchJSON("/usuarios");
export const deleteUsuario = (id) =>
  fetchJSON(`/usuarios/${id}`, { method: "DELETE" });



















