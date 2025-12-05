import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import API_URL from "../api";

const ALERTS_URL = `${API_URL}/static/alertas_timelapse.json`;

// Construye la serie de tendencia a partir de las alertas
function calcularTendenciaDesdeAlertas(alertas) {
  if (!Array.isArray(alertas) || alertas.length === 0) return [];

  const porDia = {};

  const getFecha = (a) => {
    const ts = (a.timestamp || "").slice(0, 10);
    const f = (a.fecha || "").slice(0, 10);
    return ts || f || null;
  };

  alertas.forEach((a) => {
    const fecha = getFecha(a);
    if (!fecha) return;

    if (!porDia[fecha]) {
      porDia[fecha] = {
        total: 0,
        alertas: 0,
      };
    }

    porDia[fecha].total += 1;

    const falt = Array.isArray(a.faltantes) ? a.faltantes : [];
    if (falt.length > 0) {
      porDia[fecha].alertas += 1;
    }
  });

  const fechasOrdenadas = Object.keys(porDia).sort();

  return fechasOrdenadas.map((fecha) => {
    const total = porDia[fecha].total;
    const alertasDia = porDia[fecha].alertas;
    const cumplimientos = Math.max(0, total - alertasDia);

    const porcentaje_cumplimiento =
      total === 0
        ? 100
        : Math.round((cumplimientos / total) * 100);

    return {
      fecha,
      alertas: alertasDia,
      cumplimientos,
      porcentaje_cumplimiento,
    };
  });
}


export default function Graphs() {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
  let isMounted = true;

  const fetchTrend = async () => {
    try {
      const res = await fetch(ALERTS_URL, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const serie = calcularTendenciaDesdeAlertas(data);

      if (!isMounted) return;
      setTrend(serie);
    } catch (err) {
      console.error("Error cargando tendencia:", err);
      if (!isMounted) return;
      setTrend([]);
    }
  };

  // carga inicial
  fetchTrend();

  // auto-refresh cada 5 segundos
  const interval = setInterval(fetchTrend, 5000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tendencia general */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
          📈 Tendencia de Detecciones
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={trend}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
              labelStyle={{ fontWeight: "bold", color: "#374151" }}
            />
            <Legend verticalAlign="top" align="right" />
            <Bar
              dataKey="cumplimientos"
              fill="#16a34a"
              barSize={25}
              radius={[6, 6, 0, 0]}
              name="Cumplimientos (relativos)"
            />
            <Bar
              dataKey="alertas"
              fill="#dc2626"
              barSize={25}
              radius={[6, 6, 0, 0]}
              name="Alertas"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cumplimiento porcentual */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">
          🎯 Porcentaje de Cumplimiento
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={trend}>
            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
            <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#6b7280" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#6b7280" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#fff",
                borderRadius: "8px",
                border: "1px solid #ddd",
              }}
              labelStyle={{ fontWeight: "bold", color: "#374151" }}
            />
            <Legend verticalAlign="top" align="right" />
            <Line
              type="monotone"
              dataKey="porcentaje_cumplimiento"
              stroke="#16a34a"
              strokeWidth={2}
              dot={{ r: 3 }}
              name="Cumplimiento (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
