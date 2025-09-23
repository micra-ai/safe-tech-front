import { useEffect, useState } from "react";
import { getPorHora } from "../api";

export default function HourlyChecklist() {
  const tabs = ["Todos", "En Revisión", "Crítico"];
  const [activeTab, setActiveTab] = useState("Todos");
  const [porHora, setPorHora] = useState([]);

  useEffect(() => {
    getPorHora().then(setPorHora);
  }, []);

  return (
    <div className="bg-white shadow rounded-xl p-4">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-sm font-semibold text-gray-600">
          Incumplimiento por hora
        </h3>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-3 text-xs font-semibold">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-2 py-1 rounded ${
              activeTab === tab
                ? "text-orange-600 border-b-2 border-orange-600"
                : "text-gray-400"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div className="space-y-2 text-xs">
        {porHora.map((item, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center py-1 border-b last:border-0"
          >
            <div className="flex items-center gap-2">
              <span>📷</span>
              <div>
                <div className="font-semibold">
                  {`${item.hora}:00 - ${item.hora + 1}:00`}
                </div>
                <div className="text-gray-500">{`Cuadrilla / Cámara`}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold">{item.incumplimientos} Trab.</div>
              <div className="text-gray-500">Sin EPP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
