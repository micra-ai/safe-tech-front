import { useEffect, useState } from "react";
import API_URL from "../api";

const EPP_LABELS = {
  helmet: "Casco",
  safety_vest: "Chaleco Reflectante",
  safety_jacket: "Chaqueta de Seguridad",
  safety_shoes: "Zapatos de Seguridad",
  safety_overall: "Overol",
};

export default function Detecciones() {
  const [visibles, setVisibles] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelado = false;
    let intervalId = null;

    const fetchDetecciones = async () => {
      try {
        const res = await fetch(`${API_URL}/detecciones_timelapse?limit=500`);
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();

        if (!Array.isArray(data)) {
          throw new Error("Respuesta inválida del backend");
        }

        // Orden cronológico y últimas 50
        const ordenadas = [...data].reverse().slice(0, 50);

        if (!cancelado) {
          setVisibles(ordenadas);
          setCargando(false);
          setError(null);
        }
      } catch (err) {
        console.error("Error al cargar detecciones:", err);
        if (!cancelado) {
          setError("No se pudieron cargar las detecciones.");
          setCargando(false);
        }
      }
    };

    // Primera carga
    fetchDetecciones();

    // Polling cada 3 segundos
    intervalId = setInterval(fetchDetecciones, 3000);

    return () => {
      cancelado = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">🟢 Detecciones en tiempo casi real</h2>
        <span className="text-xs text-gray-500">
          Actualizando cada 3 segundos
        </span>
      </div>

      {cargando && (
        <p className="text-gray-500">Cargando detecciones...</p>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-2">
          {error}
        </p>
      )}

      {!cargando && !error && visibles.length === 0 && (
        <p className="text-gray-500">
          No hay detecciones todavía. Cuando el sistema genere alertas, aparecerán aquí.
        </p>
      )}

      {visibles.length > 0 && (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto transition-all duration-500">
          {visibles.map((d, i) => {
            const tieneWithout =
              JSON.stringify(d).toLowerCase().includes("without") ||
              (Array.isArray(d.faltantes) && d.faltantes.length > 0);

            return (
              <li
                key={`${d.timestamp}-${d.canal}-${i}`}
                className={`border rounded-lg shadow-sm p-2 flex items-center gap-4 transition
                  ${tieneWithout ? "bg-red-100 border-red-400" : "hover:bg-gray-50"}
                `}
              >
                <img
                  src={`${API_URL}${d.imagen}`}
                  alt="detección"
                  className="w-32 h-20 object-cover rounded"
                />

                <div>
                  <p className="text-sm text-gray-700">
                    <strong>🕒 Fecha:</strong> {d.timestamp}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>🎥 Canal:</strong> {d.canal}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>✅ Detectados:</strong>{" "}
                    {Array.isArray(d.detectados) && d.detectados.length > 0
                      ? d.detectados
                          .map((e) => EPP_LABELS[e] || e)
                          .join(", ")
                      : "Ninguno"}
                  </p>

                  <p
                    className={`text-sm font-semibold ${
                      tieneWithout ? "text-red-600" : "text-gray-700"
                    }`}
                  >
                    <strong>⚠️ Faltantes:</strong>{" "}
                    {Array.isArray(d.faltantes) && d.faltantes.length > 0
                      ? d.faltantes
                          .map((e) => EPP_LABELS[e] || e)
                          .join(", ")
                      : "Ninguno"}
                  </p>

                  {tieneWithout && (
                    <p className="text-red-700 font-bold text-sm mt-1">
                      🚨 ALERTA: Persona sin EPP obligatorio
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
