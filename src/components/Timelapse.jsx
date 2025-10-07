import { useEffect, useState } from "react";

const API_URL = "https://techsyncore.duckdns.org";

export default function Timelapse() {
  const canales = ["Channel1", "Channel2", "Channel3", "Channel4"];
  const [fechas, setFechas] = useState({});
  const [imagenes, setImagenes] = useState({});
  const [diaSeleccionado, setDiaSeleccionado] = useState({});

  // Obtener días disponibles
  useEffect(() => {
    canales.forEach((canal) => {
      fetch(`${API_URL}/timelapse_detecciones/dias?canal=${canal}`)
        .then((res) => res.json())
        .then((data) => {
          console.log("📅 Días disponibles:", data);
          setFechas((prev) => ({ ...prev, [canal]: data[canal] || [] }));
        })
        .catch((err) => console.error(err));
    });
  }, []);

  // Cargar imágenes cuando se selecciona un día
  const handleSeleccionDia = (canal, fecha) => {
    setDiaSeleccionado((prev) => ({ ...prev, [canal]: fecha }));
    if (fecha) {
      fetch(`${API_URL}/timelapse_detecciones/imagenes?canal=${canal}&fecha=${fecha}`)
        .then((res) => res.json())
        .then((data) => {
          console.log(`🖼️ Imágenes recibidas de ${canal}:`, data);
          setImagenes((prev) => ({ ...prev, [canal]: data }));
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Timelapse de Cámaras</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {canales.map((canal) => (
          <div key={canal} className="bg-white shadow rounded-2xl p-4">
            <h3 className="font-semibold text-lg mb-2">
              Cámara {canal.replace("Channel", "")} <span className="text-gray-500 text-sm">({canal})</span>
            </h3>

            {/* Selector de fechas */}
            <select
              className="border rounded-lg p-2 mb-3"
              onChange={(e) => handleSeleccionDia(canal, e.target.value)}
              value={diaSeleccionado[canal] || ""}
            >
              <option value="">Sin días</option>
              {(fechas[canal] || []).map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>

            {/* Galería */}
            {imagenes[canal] && imagenes[canal].length > 0 ? (
              <div className="grid grid-cols-2 gap-2">
                {imagenes[canal].map((img, i) => (
                  <img
                    key={i}
                    src={`${API_URL}${img}`}
                    alt={`Frame ${i}`}
                    className="rounded-md shadow"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center">Selecciona un día.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
