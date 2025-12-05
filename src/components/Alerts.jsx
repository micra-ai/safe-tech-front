import { useEffect, useState } from "react";
import API_URL from "../api";

// Mapeo de las clases YOLO a texto legible
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

// URL base del JSON generado por el watcher
const ALERTS_URL = `${API_URL}/static/alertas_timelapse.json`;

// Normaliza la ruta de imagen: "/app/static/..." -> "https://host/static/..."
function normalizarRutaImagen(rawPath) {
  if (!rawPath) return null;

  let p = rawPath;

  if (p.startsWith("/app/")) {
    p = p.replace("/app", ""); // "/app/static/..." -> "/static/..."
  }

  if (!p.startsWith("/")) {
    p = "/" + p;
  }

  return `${API_URL}${p}`;
}

// Saca la fecha (YYYY-MM-DD) de una alerta
function getFechaAlerta(a) {
  if (a.fecha) return a.fecha;
  if (a.timestamp) return String(a.timestamp).split("T")[0];
  return null;
}

export default function Detecciones() {
  const [alertas, setAlertas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaFecha, setUltimaFecha] = useState(null);

  useEffect(() => {
    let cancelado = false;

    const cargarAlertas = async () => {
      try {
        setCargando(true);

        // cache-busting para obligar a traer el JSON nuevo
        const res = await fetch(`${ALERTS_URL}?t=${Date.now()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }

        const data = await res.json();
        if (!Array.isArray(data)) {
          throw new Error("El JSON de alertas no es un array");
        }

        // 1) Sacar la fecha de cada alerta
        const conFecha = data
          .map((a) => ({ ...a, __fecha__: getFechaAlerta(a) }))
          .filter((a) => !!a.__fecha__);

        if (conFecha.length === 0) {
          if (!cancelado) {
            setAlertas([]);
            setUltimaFecha(null);
            setError(null);
          }
          return;
        }

        // 2) Ordenar por fecha y timestamp descendente
        const ordenadas = [...conFecha].sort((a, b) => {
          if (a.__fecha__ === b.__fecha__) {
            const ta = a.timestamp || "";
            const tb = b.timestamp || "";
            return tb.localeCompare(ta);
          }
          return b.__fecha__.localeCompare(a.__fecha__);
        });

        // 3) Tomar la última fecha disponible (la más reciente)
        const fechaMasReciente = ordenadas[0].__fecha__;

        // 4) Filtrar SOLO las alertas de esa fecha
        const soloUltimoDia = ordenadas.filter(
          (a) => a.__fecha__ === fechaMasReciente
        );

        if (!cancelado) {
          setUltimaFecha(fechaMasReciente);
          setAlertas(
            soloUltimoDia
              .slice(0, 100) // últimas 100 del último día
              .map(({ __fecha__, ...rest }) => rest) // limpiamos campo interno
          );
          setError(null);
        }
      } catch (err) {
        console.error("Error cargando alertas:", err);
        if (!cancelado) {
          setError("No se pudieron cargar las detecciones.");
          setAlertas([]);
        }
      } finally {
        if (!cancelado) {
          setCargando(false);
        }
      }
    };

    // Primera carga
    cargarAlertas();

    // Polling cada 3 segundos (casi tiempo real)
    const id = setInterval(cargarAlertas, 3000);

    return () => {
      cancelado = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-xl font-bold">🚨 Alertas detectadas</h2>
        <span className="text-xs text-gray-500">
          Actualizando cada 3 segundos
        </span>
      </div>

      {ultimaFecha && (
        <p className="text-xs text-gray-500 mb-2">
          Mostrando alertas del día <strong>{ultimaFecha}</strong>
        </p>
      )}

      {cargando && (
        <p className="text-gray-500 text-sm">Cargando detecciones...</p>
      )}

      {error && (
        <p className="text-red-600 text-sm mb-2">
          {error}
        </p>
      )}

      {!cargando && !error && alertas.length === 0 && (
        <p className="text-gray-500">
          No hay alertas registradas todavía.
        </p>
      )}

      {alertas.length > 0 && (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto transition-all duration-500">
          {alertas.map((a, i) => {
            const detectados = Array.isArray(a.detectados) ? a.detectados : [];
            const faltantes = Array.isArray(a.faltantes) ? a.faltantes : [];

            const tieneWithout =
              faltantes.length > 0 ||
              [...detectados, ...faltantes].some((e) =>
                String(e).toLowerCase().includes("without")
              );

            const imgUrl = normalizarRutaImagen(a.image);

            return (
              <li
                key={`${a.timestamp || "sin-ts"}-${a.canal}-${i}`}
                className={`border rounded-lg shadow-sm p-2 flex items-center gap-4 transition
                  ${tieneWithout ? "bg-red-100 border-red-400" : "hover:bg-gray-50"}
                `}
              >
                {imgUrl && (
                  <img
                    src={imgUrl}
                    alt="alerta de EPP"
                    className="w-32 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                )}

                <div>
                  <p className="text-sm text-gray-700">
                    <strong>🕒 Fecha:</strong>{" "}
                    {a.fecha} {a.timestamp && `(${a.timestamp})`}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>🎥 Canal:</strong> {a.canal}
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
