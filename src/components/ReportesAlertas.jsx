import { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Traducción de etiquetas YOLO → español
const EPP_LABELS = {
  helmet: "Casco",
  safety_vest: "Chaleco",
  safety_jacket: "Chaqueta",
  safety_shoes: "Zapatos",
  safety_overall: "Overol",
};


// Llama al backend
const getFechasDisponibles = async () => {
  const res = await fetch("http://localhost:5000/fechas-disponibles");
  return res.json();
};

export default function ReportesAlertas() {
  const [fechasDisponibles, setFechasDisponibles] = useState([]);
  const [fechaInicio, setFechaInicio] = useState(null);
  const [fechaFin, setFechaFin] = useState(null);
  const [archivoGenerado, setArchivoGenerado] = useState(null);

  useEffect(() => {
    getFechasDisponibles().then((fechas) => {
      // transformar strings "2025-07-23" a objetos Date
      setFechasDisponibles(fechas.map((f) => new Date(f)));
    });
  }, []);

  const estaHabilitada = (date) => {
    return fechasDisponibles.some(
      (f) =>
        f.getFullYear() === date.getFullYear() &&
        f.getMonth() === date.getMonth() &&
        f.getDate() === date.getDate()
    );
  };

  const generarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert("Selecciona ambas fechas");
      return;
    }

    const inicioStr = fechaInicio.toISOString().slice(0, 10);
    const finStr = fechaFin.toISOString().slice(0, 10);

    const res = await fetch(
      `http://localhost:5000/generar-reporte?inicio=${inicioStr}&fin=${finStr}`
    );
    const data = await res.json();

    // 🔑 Traducir los nombres del archivo para mostrar en UI
    if (data.archivo) {
      setArchivoGenerado(data.archivo);
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
          href={`http://localhost:5000/descargar-reporte/${archivoGenerado}`}
          className="text-blue-600 underline text-sm"
          download
        >
          📥 Descargar {archivoGenerado}
        </a>
      )}

      {/* Ejemplo: vista previa de cómo se mostrarían los nombres en español */}
      {archivoGenerado && (
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Nota:</strong> Los EPP se mostrarán como:</p>
          <ul className="list-disc ml-6">
            {Object.entries(EPP_LABELS).map(([key, value]) => (
              <li key={key}>{key} → {value}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
