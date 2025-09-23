import { useEffect, useState } from "react";
import { getPorArea } from "../api";

export default function AreaCompliance() {
  const [porArea, setPorArea] = useState([]);

  useEffect(() => {
    getPorArea().then(setPorArea);
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-600">
          Incumplimiento por Área
        </h3>
        <span className="text-xs text-gray-400">*Semana actual</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
        {porArea.map((item, idx) => {
          const color =
            item.incumplimientos >= 50
              ? "bg-red-100 text-red-700"
              : item.incumplimientos >= 20
              ? "bg-yellow-100 text-yellow-700"
              : "bg-green-100 text-green-700";

          return (
            <div
              key={idx}
              className={`rounded p-2 shadow-sm ${color}`}
            >
              <div className="text-xs font-medium">{item.zona}</div>
              <div className="text-lg font-bold">{item.incumplimientos}%</div>
              <div className="text-xs">De Incumplimiento</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
