import { useState } from "react";
import API_URL from "../api";

const ALERTS_URL = `${API_URL}/static/alertas_timelapse.json`;

// Saca fecha y hora legibles desde la alerta
function parseAlertDate(alert) {
  if (alert.timestamp) {
    const [date, timeRaw] = alert.timestamp.split("T");
    const time = (timeRaw || "").split(".")[0]; // HH:MM:SS
    return { date, time };
  }
  const date = (alert.fecha || "").slice(0, 10);
  return { date, time: "" };
}

export default function ReportesAlertas() {
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  const generarReporte = async () => {
    setCargando(true);
    setError("");
    setAlertas([]);

    try {
      const res = await fetch(ALERTS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const filtradas = (Array.isArray(data) ? data : []).filter((a) => {
        const { date } = parseAlertDate(a);
        if (!date) return false;

        if (desde && date < desde) return false;
        if (hasta && date > hasta) return false;
        return true;
      });

      // Ordenamos por fecha/hora descendente
      filtradas.sort((a, b) => {
        const ad = parseAlertDate(a);
        const bd = parseAlertDate(b);
        return (bd.date + bd.time).localeCompare(ad.date + ad.time);
      });

      setAlertas(filtradas);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las alertas.");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Reportes de Alertas</h2>

      {/* Filtros simples */}
      <div className="bg-white shadow rounded-lg p-4 mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desde:
          </label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm"
            value={desde}
            onChange={(e) => setDesde(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hasta:
          </label>
          <input
            type="date"
            className="border rounded-md px-3 py-2 text-sm"
            value={hasta}
            onChange={(e) => setHasta(e.target.value)}
          />
        </div>

        <button
          onClick={generarReporte}
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-md text-sm"
          disabled={cargando}
        >
          {cargando ? "Generando..." : "Generar Reporte"}
        </button>
      </div>

      {/* Mensajes de estado */}
      {error && (
        <p className="text-red-600 text-sm mb-3">{error}</p>
      )}

      {!cargando && alertas.length === 0 && !error && (
        <p className="text-gray-500 text-sm">
          No hay alertas para el rango seleccionado.
        </p>
      )}

      {/* Tabla simple de resultados */}
      {alertas.length > 0 && (
        <div className="bg-white shadow rounded-lg p-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-2">Fecha</th>
                <th className="text-left py-2 px-2">Hora</th>
                <th className="text-left py-2 px-2">Canal</th>
                <th className="text-left py-2 px-2">Faltantes</th>
                <th className="text-left py-2 px-2">Detectados</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a, idx) => {
                const { date, time } = parseAlertDate(a);
                const faltantes = Array.isArray(a.faltantes)
                  ? a.faltantes.join(", ")
                  : "";
                const detectados = Array.isArray(a.detectados)
                  ? a.detectados.join(", ")
                  : "";

                return (
                  <tr key={idx} className="border-b last:border-0">
                    <td className="py-1 px-2">{date}</td>
                    <td className="py-1 px-2">{time}</td>
                    <td className="py-1 px-2">{a.canal}</td>
                    <td className="py-1 px-2 text-red-600">{faltantes}</td>
                    <td className="py-1 px-2 text-green-700">{detectados}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
