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

export default function Graphs() {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    const fetchTrend = async () => {
      try {
        const res = await fetch(`${API_URL}/dashboard/detecciones_tendencia`);
        const data = await res.json();
        setTrend(data);
      } catch (err) {
        console.error("Error cargando tendencia:", err);
      }
    };
    fetchTrend();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tendencia general */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">📈 Tendencia de Detecciones</h2>
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
              name="Cumplimientos"
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
        <h2 className="text-lg font-semibold mb-2">🎯 Porcentaje de Cumplimiento</h2>
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
