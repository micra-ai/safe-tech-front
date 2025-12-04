import { useEffect, useState } from "react";
import API_URL from "../api";

// Mapeo a español para las etiquetas actuales del backend
const EPP_LABELS = {
  with_helmet: "Con casco",
  without_helmet: "Sin casco",
  with_safety_vest: "Con chaleco reflectante",
  without_safety_vest: "Sin chaleco reflectante",
  with_gloves: "Con guantes",
  without_gloves: "Sin guantes",
  with_glasses: "Con lentes de seguridad",
  without_glasses: "Sin lentes de seguridad",
  with_shoes: "Con zapatos de seguridad",
  without_shoes: "Sin zapatos de seguridad",
  with_overall: "Con overol",
  without_overall: "Sin overol",
};

export default function Detecciones() {
  const [detecciones, setDetecciones] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Ajusta ESTA ruta al endpoint que te devuelve exactamente
  // el JSON que mostraste en la captura
  const ENDPOINT = `${API_URL}/detecciones/timelapse?limit=500`;
  // si tu endpoint real es otro (por ej. /timelapse_processed),
  // solo cambia esa parte.

  // Normalizar la ruta de imagen: /app/static/...  ->  https://host/static/...
  const normalizarRutaImagen = (ruta) => {
    if (!ruta) return null;

    let r = ruta;
    // quitar prefijo /app si viene desde el filesystem
    if (r.startsWith("/app/")) {
      r = r.replace("/app", "");
    }
    // asegurar que empiece con /static
    if (!r.startsWith("/static")) {
      // por seguridad, si viniera otra cosa rara
      return `${API_URL}${r}`;
    }
    return `${API_URL}${r}`;
  };

  useEffect(() => {
    let cancelado = false;

    const fetchDetecciones = async () => {
      try {
        const res = await fetch(ENDPOINT);

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("Respuesta inválida del backend");
        }

        // Ordenar por timestamp descendente (últimas primero)
        const ordenadas = [...data].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );

        if (!cancelado) {
          setDetecciones(ordenadas.slice(0, 50)); // últimas 50
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

    // primera carga + polling cada 3 segundos
    fetchDetecciones();
    const id = setInterval(fetchDetecciones, 3000);

    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, [ENDPOINT]);

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

      {!cargando && !error && detecciones.length === 0 && (
        <p className="text-gray-500">
          No hay detecciones todavía. Cuando el sistema genere alertas, aparecerán aquí.
        </p>
      )}

      {detecciones.length > 0 && (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto transition-all duration-500">
          {detecciones.map((d, i) => {
            const detectados = Array.isArray(d.detectados) ? d.detectados : [];
            const faltantes = Array.isArray(d.faltantes) ? d.faltantes : [];

            const tieneWithout =
              faltantes.length > 0 ||
              [...detectados, ...faltantes].some((e) =>
                String(e).toLowerCase().includes("without")
              );

            const imageUrl = normalizarRutaImagen(d.image);

            return (
              <li
                key={`${d.timestamp}-${d.canal}-${i}`}
                className={`border rounded-lg shadow-sm p-2 flex items-center gap-4 transition
                  ${tieneWithout ? "bg-red-100 border-red-400" : "hover:bg-gray-50"}
                `}
              >
                {imageUrl && (
                  <img
                    src={imageUrl}
                    alt="detección"
                    className="w-32 h-20 object-cover rounded"
                    onError={(e) => {
                      // por si alguna ruta viene mala, no revienta el layout
                      e.target.style.display = "none";
                    }}
                  />
                )}

                <div>
                  <p className="text-sm text-gray-700">
                    <strong>🕒 Fecha:</strong> {d.fecha} ({d.timestamp})
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>🎥 Canal:</strong> {d.canal}
                  </p>

                  <p className="text-sm text-gray-700">
                    <strong>✅ Detectados:</strong>{" "}
                    {detectados.length > 0
                      ? detectados
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
                    {faltantes.length > 0
                      ? faltantes
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
