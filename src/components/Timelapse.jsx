import { useEffect, useState } from "react";

const API_URL = "https://techsyncore.duckdns.org";

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
      fetch(`${API_URL}/timelapse_detecciones/imagenes?canal=${canal}&fecha=${fecha}`)
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
        }, 300); // velocidad de animación (ms por frame)
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
                <img
                  src={`${API_URL}${imagenes[canal][frameActual[canal] || 0]}`}
                  alt={`Frame ${frameActual[canal]}`}
                  className="rounded-lg shadow-md w-full object-cover"
                />
                <p className="absolute bottom-2 right-3 text-xs bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                  {frameActual[canal] + 1}/{imagenes[canal].length}
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

