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
import { getDashboardTrend } from "../api";

export default function Graphs() {
  const [trend, setTrend] = useState([]);

  useEffect(() => {
    getDashboardTrend().then(setTrend);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Tendencia de cumplimiento */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Tendencia de cumplimiento</h2>
        <ResponsiveContainer width="100%" height={300}>
  <LineChart data={trend}>
    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
    <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#6b7280" }} />
    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
    <Tooltip
      contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
      labelStyle={{ fontWeight: "bold", color: "#374151" }}
    />
    <Legend verticalAlign="top" align="right" />
    <Line
      type="monotone"
      dataKey="cumplimiento"
      stroke="#16a34a"
      strokeWidth={2}
      dot={{ r: 3 }}
      isAnimationActive={true}
      name="Cumplimiento (%)"
    />
  </LineChart>
</ResponsiveContainer>

      </div>

      {/* Alertas vs Cumplimiento */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Alertas vs. Cumplimiento</h2>
        <ResponsiveContainer width="100%" height={300}>
  <BarChart data={trend}>
    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
    <XAxis dataKey="fecha" tick={{ fontSize: 12, fill: "#6b7280" }} />
    <YAxis tick={{ fontSize: 12, fill: "#6b7280" }} />
    <Tooltip
      contentStyle={{ backgroundColor: "#fff", borderRadius: "8px", border: "1px solid #ddd" }}
      labelStyle={{ fontWeight: "bold", color: "#374151" }}
    />
    <Legend verticalAlign="top" align="right" />
    <Bar
      dataKey="incumplimientos"
      fill="#dc2626"
      barSize={30}
      radius={[6, 6, 0, 0]}
      name="Alertas"
    />
    <Line
      type="monotone"
      dataKey="cumplimiento"
      stroke="#16a34a"
      strokeWidth={2}
      dot={{ r: 3 }}
      name="Cumplimiento (%)"
    />
  </BarChart>
</ResponsiveContainer>

      </div>
    </div>
  );
}
