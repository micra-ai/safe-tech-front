import { useEffect, useState } from "react";
import { getDashboardMetrics, getEstadoDeteccion, setEstadoDeteccion } from "../api";

// 🔑 Diccionario de traducción
const EPP_LABELS = {
  helmet: "Casco",
  safety_vest: "Chaleco Reflectante",
  safety_jacket: "Chaqueta de Seguridad",
  safety_shoes: "Zapatos de Seguridad",
  safety_overall: "Overol",
};

export default function StatsCards() {
  const [metrics, setMetrics] = useState({});
  const [activo, setActivo] = useState(false);

  // Cargar métricas y estado al inicio
  useEffect(() => {
    getDashboardMetrics().then(setMetrics);
    getEstadoDeteccion().then((res) => setActivo(res.activo));
  }, []);

  // Refrescar métricas cada 5s si está activo
  useEffect(() => {
    let interval;
    if (activo) {
      interval = setInterval(() => {
        getDashboardMetrics().then(setMetrics);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [activo]);

  // Iniciar/detener detección remoto
  const manejarDeteccion = () => {
    if (!activo) {
      setEstadoDeteccion(true).then(() => setActivo(true));
    } else {
      setEstadoDeteccion(false).then(() => setActivo(false));
    }
  };

  // Reiniciar métricas solo en frontend (sin tocar base de datos)
  const reiniciarMetricas = () => {
    setMetrics({
      incumplimientos_epp: 0,
      porcentaje_cumplimiento: 100,
      epp_mas_incumplidos: [],
      ultimas: [],
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
            <p className="text-sm text-gray-500">Sin incumplimientos registrados</p>
          )}
        </div>
        <div className="p-4">
          <button
            onClick={manejarDeteccion}
            className={`mt-2 px-4 py-2 rounded text-white w-full ${
              activo
                ? "bg-red-600 hover:bg-red-700"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {activo ? "Detener detección" : "Iniciar detección"}
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
          <p className="text-xs text-gray-500 mt-1">Total de incumplimientos hoy</p>
        </div>
      </div>

      {/* Tarjeta 3: Últimas alertas */}
      <div className="bg-white shadow rounded-lg">
        <div className="bg-gray-100 text-[#112d5a] px-4 py-2 rounded-t-lg flex items-center gap-2">
          <span>🚨</span>
          <h3 className="text-sm font-semibold">Últimas alertas</h3>
        </div>

        <div className="p-4">
          {metrics?.ultimas?.slice(0, 2).map((alerta, idx) => (
            <div key={idx} className="flex justify-between text-sm mt-2">
              <span>{alerta.timestamp.split(" ")[0]}</span>
              <span className="text-red-600 font-semibold">
                {alerta.epp_faltantes.length}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
