import { useState, useEffect } from "react";
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

  // Función central para cargar alertas según filtros
  const generarReporte = async () => {
    setCargando(true);
    setError("");

    try {
      const res = await fetch(ALERTS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      let filtradas = Array.isArray(data) ? data : [];

      // Filtro por fecha (opcional)
      if (desde) {
        filtradas = filtradas.filter((a) => {
          const { date } = parseAlertDate(a);
          return date >= desde;
        });
      }

      if (hasta) {
        filtradas = filtradas.filter((a) => {
          const { date } = parseAlertDate(a);
          return date <= hasta;
        });
      }

      // Ordenar por fecha/hora descendente
      filtradas.sort((a, b) => {
        const ad = parseAlertDate(a);
        const bd = parseAlertDate(b);
        const aKey = `${ad.date}T${ad.time}`;
        const bKey = `${bd.date}T${bd.time}`;
        return bKey.localeCompare(aKey);
      });

      setAlertas(filtradas);
    } catch (err) {
      console.error("Error generando reporte:", err);
      setError("No se pudieron cargar las alertas.");
      setAlertas([]);
    } finally {
      setCargando(false);
    }
  };

  // 🔁 Auto-refresh igual que las métricas
  useEffect(() => {
    // carga inicial
    generarReporte();

    // recarga cada 5 segundos
    const interval = setInterval(() => {
      generarReporte();
    }, 5000);

    return () => clearInterval(interval);
  }, [desde, hasta]);

  return (
    <div className="bg-white rounded-2xl shadow p-4">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Reportes de Alertas</h2>
          <p className="text-xs text-gray-500">
            Filtra por rango de fechas para revisar incumplimientos históricos.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Desde
            </label>
            <input
              type="date"
              className="border rounded-lg px-2 py-1 text-sm"
              value={desde}
              onChange={(e) => setDesde(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">
              Hasta
            </label>
            <input
              type="date"
              className="border rounded-lg px-2 py-1 text-sm"
              value={hasta}
              onChange={(e) => setHasta(e.target.value)}
            />
          </div>

          <button
            onClick={generarReporte}
            className="ml-2 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
          >
            Generar reporte
          </button>
        </div>
      </div>

      {error && (
        <p className="text-red-500 text-xs mb-2">{error}</p>
      )}

      {cargando && (
        <p className="text-gray-500 text-xs mb-2">
          Cargando alertas...
        </p>
      )}

      {!cargando && alertas.length === 0 && !error && (
        <p className="text-gray-400 text-xs">
          No hay alertas registradas en el rango seleccionado.
        </p>
      )}

      {alertas.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="py-2 px-2 text-left">Fecha</th>
                <th className="py-2 px-2 text-left">Hora</th>
                <th className="py-2 px-2 text-left">Canal</th>
                <th className="py-2 px-2 text-left">Faltantes</th>
                <th className="py-2 px-2 text-left">Detectados</th>
              </tr>
            </thead>
            <tbody>
              {alertas.map((a, idx) => {
                const { date, time } = parseAlertDate(a);
                const faltantes = (a.faltantes || []).join(", ");
                const detectados = (a.detectados || []).join(", ");

                return (
                  <tr
                    key={idx}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-1 px-2">{date}</td>
                    <td className="py-1 px-2">{time}</td>
                    <td className="py-1 px-2">{a.canal}</td>
                    <td className="py-1 px-2 text-red-600">
                      {faltantes}
                    </td>
                    <td className="py-1 px-2 text-green-700">
                      {detectados}
                    </td>
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
