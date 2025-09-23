import { useEffect, useState } from "react";
import { getDashboardMetrics } from "../api";

// 🔑 Diccionario de traducción (puedes moverlo a utils si quieres)
const EPP_LABELS = {
  helmet: "Casco",
  safety_vest: "Chaleco Reflectante",
  safety_jacket: "Chaqueta de Seguridad",
  safety_shoes: "Zapatos de Seguridad",
  safety_overall: "Overol",
};

export default function Alerts() {
  const [ultimas, setUltimas] = useState([]);

  useEffect(() => {
    getDashboardMetrics().then((data) => setUltimas(data?.ultimas || []));
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <h2 className="text-xl font-bold mb-4">Últimas Alertas</h2>
      {ultimas.length === 0 ? (
        <p className="text-gray-500">No hay alertas recientes.</p>
      ) : (
        <ul className="space-y-2">
          {ultimas.map((alerta, index) => (
            <li key={index} className="border-b pb-2">
              <p className="text-sm text-gray-600">
                <strong>Hora:</strong> {alerta.timestamp}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Faltantes:</strong>{" "}
                {alerta.epp_faltantes.length > 0
                  ? alerta.epp_faltantes
                      .map((e) => EPP_LABELS[e] || e) // 🔑 Traducción aquí
                      .join(", ")
                  : "Ninguno"}
              </p>
              <p className="text-sm text-gray-600">
                <strong>Zonas restringidas:</strong>{" "}
                {alerta.zonas_restringidas?.length > 0
                  ? alerta.zonas_restringidas.join(", ")
                  : "Ninguna"}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
