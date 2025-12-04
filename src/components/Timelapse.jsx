import { useEffect, useState } from "react";

const API_URL = "https://techsyncore.duckdns.org";

// 🔹 Normaliza cualquier ruta que venga del backend
function normalizarBasePath(frameUrl) {
  if (!frameUrl) return "";

  let p = frameUrl;

  // Por si en el futuro viene como objeto
  if (typeof p === "object") {
    p = p.url || p.image || p.path || p.filename || "";
  }

  // Sacar prefijo de filesystem
  if (p.startsWith("/app/")) {
    p = p.replace("/app", ""); // "/app/static/..." -> "/static/..."
  }

  // Asegurar que parte con "/"
  if (!p.startsWith("/")) {
    p = "/" + p;
  }

  return p; // todavía sin API_URL
}

export default function Timelapse() {
  const canales = ["Channel1", "Channel2", "Channel3", "Channel4"];
  const [fechas, setFechas] = useState({});
  const [imagenes, setImagenes] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState({});
  const [frameActual, setFrameActual] = useState({});

  // Obtener días disponibles por canal
  useEffect(() => {
    canales.forEach((canal) => {
      fetch(`${API_URL}/timelapse_detecciones/dias?canal=${canal}`)
        .then((res) => res.json())
        .then((data) => {
          setFechas((prev) => ({ ...prev, [canal]: data || [] }));
        })
        .catch((err) => console.error(err));
    });
  }, []);

  // Cargar imágenes de la fecha seleccionada
  const handleSeleccionDia = (canal, fecha) => {
    setDiaSeleccionado((prev) => ({ ...prev, [canal]: fecha }));
    if (fecha) {
      fetch(
        `${API_URL}/timelapse_detecciones/imagenes?canal=${canal}&fecha=${fecha}`
      )
        .then((res) => res.json())
        .then((data) => {
          setImagenes((prev) => ({ ...prev, [canal]: data }));
          setFrameActual((prev) => ({ ...prev, [canal]: 0 })); // reinicia animación
        })
        .catch((err) => console.error(err));
    }
  };

  // Reproducción automática (timelapse)
  useEffect(() => {
    const intervalos = {};
    canales.forEach((canal) => {
      if (imagenes[canal]?.length > 1) {
        intervalos[canal] = setInterval(() => {
          setFrameActual((prev) => ({
            ...prev,
            [canal]:
              prev[canal] + 1 < imagenes[canal].length
                ? prev[canal] + 1
                : 0, // vuelve al inicio
          }));
        }, 2500); // velocidad de animación (ms por frame)
      }
    });
    return () => Object.values(intervalos).forEach(clearInterval);
  }, [imagenes]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Timelapse de Cámaras</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {canales.map((canal) => (
          <div key={canal} className="bg-white shadow rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-2">
              Cámara {canal.replace("Channel", "")}{" "}
              <span className="text-gray-500 text-sm">({canal})</span>
            </h3>

            {/* Selector de día */}
            <select
              className="border rounded-lg p-2 mb-3 w-full"
              onChange={(e) => handleSeleccionDia(canal, e.target.value)}
              value={diaSeleccionado[canal] || ""}
            >
              <option value="">Sin días</option>
              {(fechas[canal] || []).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>

            {/* Timelapse */}
            {imagenes[canal] && imagenes[canal].length > 0 ? (
              <div className="relative flex justify-center items-center">
                {(() => {
                  const idx = frameActual[canal] || 0;
                  const frameUrl = imagenes[canal][idx];

                  // base normalizada (sin /app, siempre con /)
                  const basePath = normalizarBasePath(frameUrl);

                  // versión procesada (YOLO) y versión original
                  const processedPath = basePath.replace(
                    "timelapse_frames",
                    "timelapse_processed"
                  );
                  const originalPath = basePath; // por si processed no existe

                  const processedSrc = `${API_URL}${processedPath}`;
                  const originalSrc = `${API_URL}${originalPath}`;

                  console.log("Timelapse src =>", canal, processedSrc);

                  return (
                    <img
                      src={processedSrc}
                      alt={`Frame ${idx}`}
                      className="rounded-lg shadow-md w-full object-cover"
                      onError={(e) => {
                        console.error(
                          "Error cargando frame timelapse procesado, usando original:",
                          processedSrc
                        );
                        e.target.src = originalSrc;
                      }}
                    />
                  );
                })()}

                <p className="absolute bottom-2 right-3 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  {(frameActual[canal] || 0) + 1}/{imagenes[canal].length}
                </p>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                Selecciona un día.
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
