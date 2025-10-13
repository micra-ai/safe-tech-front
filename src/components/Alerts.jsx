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
  const [detecciones, setDetecciones] = useState([]);
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);

  const fetchDetecciones = async (newLimit = limit) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/detecciones/timelapse?limit=${newLimit}`);
      const data = await res.json();
      setDetecciones(data);
      setLimit(newLimit);
    } catch (err) {
      console.error("Error al cargar detecciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetecciones();
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <h2 className="text-xl font-bold mb-4">📸 Detecciones Simuladas (Timelapse)</h2>

      {loading ? (
        <p className="text-gray-500">Cargando detecciones...</p>
      ) : detecciones.length === 0 ? (
        <p className="text-gray-500">No hay imágenes disponibles en los timelapses.</p>
      ) : (
        <>
          <ul className="space-y-4 max-h-[70vh] overflow-y-auto">
            {detecciones.map((d, i) => (
              <li key={i} className="border rounded-lg shadow-sm p-2 flex items-center gap-4">
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
                    {d.detectados.map((e) => EPP_LABELS[e] || e).join(", ")}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>⚠️ Faltantes:</strong>{" "}
                    {d.faltantes.length > 0
                      ? d.faltantes.map((e) => EPP_LABELS[e] || e).join(", ")
                      : "Ninguno"}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => fetchDetecciones(limit + 100)}
              className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
            >
              🔄 Cargar más
            </button>
          </div>
        </>
      )}
    </div>
  );
}
