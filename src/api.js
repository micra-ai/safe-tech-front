// api.js

// Usa la URL de entorno (Vercel/Render/ngrok) o localhost por defecto
const API_URL = import.meta.env.VITE_API_URL;

console.log("🚀 API_URL en runtime:", API_URL);

export async function fetchJSON(path, opts = {}) {
  console.log("👉 Llamando a:", `${API_URL}${path}`);

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });

  console.log("🔵 Respuesta completa:", res);

  // Leemos como texto para verificar si devuelve JSON o HTML
  const text = await res.text();
  console.log("🔵 Body recibido:", text);

  try {
    return JSON.parse(text);   // Intentamos parsear a JSON
  } catch (err) {
    console.error("❌ Error: no es JSON válido");
    throw err;
  }
}

/* ---------- Métricas ---------- */
export async function getDashboardMetrics() {
  try {
    return await fetchJSON("/dashboard/metrics"); // ✅ corregido
  } catch {
    return {
      incumplimientos_epp: 0,
      porcentaje_cumplimiento: 100,
      epp_mas_incumplidos: [],
      ultimas: [],
    };
  }
}

// 🔹 Tendencia
export const getDashboardTrend = () => fetchJSON("/dashboard/trend"); // ✅ corregido

// 🔹 Reiniciar métricas
export const reiniciarMetricas = () =>
  fetchJSON("/dashboard/reset", { method: "POST" }); // ✅ corregido

/* ---------- Reportes ---------- */
export const getFechasDisponibles = () => fetchJSON("/fechas-disponibles");
export const getReportesAlertas = () => fetchJSON("/reportes-alertas");

/* ---------- Timelapse general ---------- */
export const getTimelapseDias = () => fetchJSON("/timelapse/dias");

export async function getTimelapse(dia, canal) {
  if (!dia) return [];
  const q = new URLSearchParams({ dia });
  if (canal) q.set("canal", canal);
  return fetchJSON(`/timelapse?${q.toString()}`);
}

/* ---------- Timelapse de detecciones ---------- */
export async function getTimelapseDetecciones(dia, canal) {
  if (!dia || !canal) return [];
  const q = new URLSearchParams({ dia, canal });
  return fetchJSON(`/timelapse_detecciones?${q.toString()}`);
}

export async function getTimelapseDeteccionesDias(canal) {
  const q = new URLSearchParams(canal ? { canal } : {});
  return fetchJSON(`/timelapse_detecciones/dias?${q.toString()}`);
}

/* ---------- Videos ---------- */
export const subirYDetectarVideo = async (file) => {
  const fd = new FormData();
  fd.append("file", file);
  return fetch(`${API_URL}/detectar/video`, { method: "POST", body: fd }).then(
    (res) => res.json()
  );
};
export const listarVideos = () => fetchJSON("/videos");

/* ---------- Auth ---------- */
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

export const logoutUser = () =>
  fetchJSON("/auth/logout", { method: "POST" });

/* ---------- Gestión de usuarios (solo admin) ---------- */
export const getUsuarios = () => fetchJSON("/usuarios");
export const deleteUsuario = (id) =>
  fetchJSON(`/usuarios/${id}`, { method: "DELETE" });

/* ---------- Estado remoto de detección ---------- */
export const getEstadoDeteccion = () => fetchJSON("/deteccion/estado");

export const setEstadoDeteccion = (activo) =>
  fetchJSON("/deteccion/estado", {
    method: "POST",
    body: JSON.stringify({ activo }),
    headers: { "Content-Type": "application/json" },
  });




















