import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// 👇 importa tu base de API y helpers
import API_URL, { getFechasDisponibles } from "../api";

// Traducción de etiquetas YOLO → español (solo para mostrar en la nota)
const EPP_LABELS = {
  helmet: "Casco",
  safety_vest: "Chaleco",
  safety_jacket: "Chaqueta",
  safety_shoes: "Zapatos",
  safety_overall: "Overol",
};

export default function ReportesAlertas() {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [archivoGenerado, setArchivoGenerado] = useState(null);

  useEffect(() => {
    // ✅ usa el helper que ya respeta API_URL
    getFechasDisponibles()
      .then((fechas) => {
        // fechas viene como ["2025-07-23", ...] → convierto a Date
        setFechasDisponibles(fechas.map((f) => new Date(f)));
      })
      .catch((err) => {
        console.error("Error al cargar fechas disponibles:", err);
        setFechasDisponibles([]);
      });
  }, []);

  const estaHabilitada = (date) =>
    fechasDisponibles.some(
      (f) =>
        f.getFullYear() === date.getFullYear() &&
        f.getMonth() === date.getMonth() &&
        f.getDate() === date.getDate()
    );

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas");
      return;
    }
    try {
      const inicioStr = fechaInicio.toISOString().slice(0, 10);
      const finStr = fechaFin.toISOString().slice(0, 10);

      const res = await fetch(
        `${API_URL}/generar-reporte?inicio=${inicioStr}&fin=${finStr}`
      );
      const data = await res.json();

      if (data && data.archivo) {
        setArchivoGenerado(data.archivo);
      } else {
        setArchivoGenerado(null);
        alert("No se pudo generar el reporte.");
      }
    } catch (e) {
      console.error("Error generando reporte:", e);
      alert("Ocurrió un error generando el reporte.");
    }
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-xl font-bold mb-4">Reportes de Alertas</h2>

      <div className="flex flex-col md:flex-row gap-4 items-center mb-6">
        <div>
          <label className="block text-sm mb-1">Desde:</label>
          <DatePicker
            selected={fechaInicio}
            onChange={(date) => setFechaInicio(date)}
            filterDate={estaHabilitada}
            placeholderText="Selecciona fecha"
            className="border rounded px-2 py-1"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Hasta:</label>
          <DatePicker
            selected={fechaFin}
            onChange={(date) => setFechaFin(date)}
            filterDate={estaHabilitada}
            placeholderText="Selecciona fecha"
            className="border rounded px-2 py-1"
          />
        </div>

        <button
          onClick={generarReporte}
          className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 mt-4 md:mt-6"
        >
          Generar Reporte
        </button>
      </div>

      {archivoGenerado && (
        <a
          href={`${API_URL}/descargar-reporte/${archivoGenerado}`}
          className="text-blue-600 underline text-sm"
          download
        >
          📥 Descargar {archivoGenerado}
        </a>
      )}

      {archivoGenerado && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            <strong>Nota:</strong> Los EPP se mostrarán como:
          </p>
          <ul className="list-disc ml-6">
            {Object.entries(EPP_LABELS).map(([key, value]) => (
              <li key={key}>
                {key} → {value}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
