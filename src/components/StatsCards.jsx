import { useEffect, useState } from "react";
import API_URL from "../api";

// Diccionario de traducción
// Diccionario final para clases YOLO exactas
const EPP_LABELS = {
  with_helmet: "Con casco",
  without_helmet: "Sin casco",

  with_safety_vest: "Con chaleco reflectante",
  without_safety_vest: "Sin chaleco reflectante",

  with_glasses: "Con lentes de seguridad",
  without_glasses: "Sin lentes de seguridad",

  with_gloves: "Con guantes",
  without_gloves: "Sin guantes",

  with_shoes: "Con zapatos de seguridad",
  without_shoes: "Sin zapatos de seguridad",

  with_overall: "Con overol",
  without_overall: "Sin overol",
};


const ALERTS_URL = `${API_URL}/static/alertas_timelapse.json`;

// Calcula métricas a partir del JSON de alertas
function calcularMetricsDesdeAlertas(alertas) {
  if (!Array.isArray(alertas) || alertas.length === 0) {
    return {
      incumplimientos_epp: 0,
      porcentaje_cumplimiento: 100,
      epp_mas_incumplidos: [],
      ultimas: [],
      imagenes_procesadas: 0,
      fecha_referencia: null,
    };
  }

  const hoyStr = new Date().toISOString().slice(0, 10);

  const getFecha = (a) => {
    const ts = (a.timestamp || "").slice(0, 10);
    const f = (a.fecha || "").slice(0, 10);
    return ts || f || null;
  };

  // 1) Intentar con HOY
  let fechaRef = hoyStr;
  let registrosDia = alertas.filter((a) => getFecha(a) === fechaRef);

  // 2) Si hoy no hay datos, usar el ÚLTIMO día con registros
  if (registrosDia.length === 0) {
    const fechas = Array.from(
      new Set(alertas.map(getFecha).filter(Boolean))
    ).sort(); // ascendente

    if (fechas.length === 0) {
      return {
        incumplimientos_epp: 0,
        porcentaje_cumplimiento: 100,
        epp_mas_incumplidos: [],
        ultimas: [],
        imagenes_procesadas: 0,
        fecha_referencia: null,
      };
    }

    fechaRef = fechas[fechas.length - 1]; // último día
    registrosDia = alertas.filter((a) => getFecha(a) === fechaRef);
  }

  const totalDetecciones = registrosDia.length;

  // Incumplimientos = detecciones con faltantes
  const esAlerta = (a) =>
    Array.isArray(a.faltantes) && a.faltantes.length > 0;

  const totalAlertas = registrosDia.filter(esAlerta).length;
  const totalCumplimientos = totalDetecciones - totalAlertas;

  const porcentaje_cumplimiento =
    totalDetecciones === 0
      ? 100
      : Math.round((totalCumplimientos / totalDetecciones) * 100);

  // Contar EPP más incumplidos
  const contador = {};
  for (const a of registrosDia) {
    const falt = Array.isArray(a.faltantes) ? a.faltantes : [];
    for (const f of falt) {
      contador[f] = (contador[f] || 0) + 1;
    }
  }

  const epp_mas_incumplidos = Object.entries(contador).sort(
    (a, b) => b[1] - a[1]
  );

  return {
    incumplimientos_epp: totalAlertas,
    porcentaje_cumplimiento,
    epp_mas_incumplidos,
    ultimas: registrosDia.slice(-5),
    imagenes_procesadas: totalDetecciones,
    fecha_referencia: fechaRef,
  };
}


export default function StatsCards() {
  const [metrics, setMetrics] = useState({});

  const cargarMetrics = async () => {
    try {
      const res = await fetch(ALERTS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMetrics(calcularMetricsDesdeAlertas(data));
    } catch (err) {
      console.error("Error cargando métricas desde alertas:", err);
      setMetrics({
        incumplimientos_epp: 0,
        porcentaje_cumplimiento: 100,
        epp_mas_incumplidos: [],
        ultimas: [],
        imagenes_procesadas: 0,
      });
    }
  };

  // Cargar métricas al inicio
  useEffect(() => {
    cargarMetrics();
  }, []);

  // Refrescar métricas cada 5s (detección automática)
  useEffect(() => {
    const interval = setInterval(() => {
      cargarMetrics();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reiniciar métricas en frontend (solo visual)
  const reiniciarMetricas = () => {
    setMetrics({
      incumplimientos_epp: 0,
      porcentaje_cumplimiento: 100,
      epp_mas_incumplidos: [],
      ultimas: [],
      imagenes_procesadas: 0,
    });
  };

  return (
    <div className="grid gap-6 grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
      {/* Tarjeta 1: Faltantes más comunes */}
      <div className="bg-white shadow rounded-lg">
  <div className="bg-[#112d5a] text-white px-4 py-2 rounded-t-lg flex items-center gap-2">
    <span>📋</span>
    <h3 className="text-sm font-semibold">Faltantes más comunes</h3>
  </div>

  <div className="p-4 space-y-1">
    {metrics?.epp_mas_incumplidos?.length > 0 ? (
      metrics.epp_mas_incumplidos.slice(0, 5).map(([epp, cantidad], idx) => (
        <div key={idx} className="text-sm text-[#112d5a]">
          • {EPP_LABELS[epp] || epp} ({cantidad})
        </div>
      ))
    ) : (
      <p className="text-sm text-gray-500">
        Sin incumplimientos registrados
      </p>
    )}
  </div>

        <div className="p-4">
          <button
            onClick={reiniciarMetricas}
            className="mt-2 px-4 py-2 rounded border border-gray-300 text-xs w-full text-gray-600 hover:bg-gray-50"
          >
            Reiniciar métricas locales
          </button>
        </div>
      </div>

      {/* Tarjeta 2: Alertas activas */}
      <div className="bg-white shadow rounded-lg">
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded-t-lg flex items-center gap-2">
          <span>🚨</span>
          <h3 className="text-sm font-semibold">Alertas activas</h3>
        </div>
        <div className="p-4">
          <p className="text-4xl font-bold text-red-700 mt-2">
            {metrics?.incumplimientos_epp ?? "-"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total de incumplimientos hoy
          </p>
        </div>
      </div>

      {/* Tarjeta 3: Imágenes procesadas */}
      <div className="bg-white shadow rounded-lg">
        <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-t-lg flex items-center gap-2">
          <span>📸</span>
          <h3 className="text-sm font-semibold">Imágenes procesadas</h3>
        </div>
        <div className="p-4 text-center">
          <p className="text-4xl font-bold text-blue-700 mt-2">
            {metrics?.imagenes_procesadas ?? 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Total de imágenes analizadas hoy
          </p>
        </div>
      </div>
    </div>
  );
}
