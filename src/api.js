export const API_URL = "https://backend-camaras.onrender.com";
export const abs = (p) => (p?.startsWith("http") ? p : `${API_URL}${p}`);

async function fetchJSON(path, opts = {}) {
  const res = await fetch(`${API_URL}${path}`, opts);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

/* ---------- Live detect ---------- */
export const iniciarDeteccion = () =>
  fetchJSON("/detectar_continuo", { method: "POST" });
export const detenerDeteccion = () =>
  fetchJSON("/detener", { method: "POST" });

/* ---------- Métricas ---------- */
export async function getDashboardMetrics() {
  try {
    return await fetchJSON("/dashboard/metrics");
  } catch {
    return {
      incumplimientos_epp: 0,
      porcentaje_cumplimiento: 100,
      epp_mas_incumplidos: [],
      ultimas: [],
    };
  }
}

// 🔑 Nuevo endpoint de tendencia corregido
export const getDashboardTrend = () => fetchJSON("/dashboard/trend");

export const reiniciarMetricas   = () => fetchJSON("/dashboard/reset", { method: "POST" });

/* ---------- Reportes ---------- */
export const getFechasDisponibles = () => fetchJSON("/fechas-disponibles");
export const getReportesAlertas   = () => fetchJSON("/reportes-alertas");

/* ---------- Timelapse general ---------- */
export const getTimelapseDias = () => fetchJSON("/timelapse/dias");

/** Frames del timelapse general (por día y canal). */
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
  return fetchJSON("/detectar/video", { method: "POST", body: fd });
};
export const listarVideos = () => fetchJSON("/videos");

/* ---------- Auth ---------- */
export const registerUser = (data) =>
  fetchJSON("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const loginUser = (data) =>
  fetchJSON("/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

export const getCurrentUser = () => fetchJSON("/auth/me");

export const logoutUser = () =>
  fetchJSON("/auth/logout", { method: "POST" });

/* ---------- Gestión de usuarios (solo admin) ---------- */
export const getUsuarios = () => fetchJSON("/usuarios");

export const deleteUsuario = (id) =>
  fetchJSON(`/usuarios/${id}`, { method: "DELETE" });
