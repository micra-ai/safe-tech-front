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
  const [todas, setTodas] = useState([]); // todas las imágenes disponibles
  const [visibles, setVisibles] = useState([]); // las que se van mostrando
  const [running, setRunning] = useState(false);

  // 1️⃣ Cargar todas las imágenes históricas una vez
  useEffect(() => {
    const fetchDetecciones = async () => {
      try {
        const res = await fetch(`${API_URL}/detecciones/timelapse?limit=500`);
        const data = await res.json();
        setTodas(data.reverse()); // en orden cronológico
      } catch (err) {
        console.error("Error al cargar detecciones:", err);
      }
    };
    fetchDetecciones();
  }, []);

  // 2️⃣ Simular detecciones en vivo
  useEffect(() => {
    if (!running || todas.length === 0) return;

    let index = 0;
    const interval = setInterval(() => {
      setVisibles((prev) => {
        if (index < todas.length) {
          const nueva = todas[index];
          index += 1;
          return [nueva, ...prev].slice(0, 50); // mostrar últimas 50
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000); // cada 2 segundos

    return () => clearInterval(interval);
  }, [running, todas]);

  const toggleSimulacion = () => {
    setVisibles([]);
    setRunning(!running);
  };

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">
          {running ? "🟢 Simulación en vivo" : "⚪ Detecciones simuladas (timelapse)"}
        </h2>
        <button
          onClick={toggleSimulacion}
          className={`px-4 py-2 rounded text-white ${
            running
              ? "bg-red-600 hover:bg-red-700"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {running ? "Detener" : "Iniciar Simulación"}
        </button>
      </div>

      {visibles.length === 0 ? (
        <p className="text-gray-500">
          {running
            ? "Cargando detecciones..."
            : "Presiona 'Iniciar Simulación' para comenzar."}
        </p>
      ) : (
        <ul className="space-y-4 max-h-[70vh] overflow-y-auto transition-all duration-500">
  {visibles.map((d, i) => {
    // Detectar alertas:
    const tieneWithout =
      JSON.stringify(d).toLowerCase().includes("without") ||
      d.faltantes.length > 0;

    return (
      <li
        key={i}
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
            {d.detectados.map((e) => EPP_LABELS[e] || e).join(", ") || "Ninguno"}
          </p>

          <p className={`text-sm font-semibold
            ${tieneWithout ? "text-red-600" : "text-gray-700"}
          `}>
            <strong>⚠️ Faltantes:</strong>{" "}
            {d.faltantes.length > 0
              ? d.faltantes.map((e) => EPP_LABELS[e] || e).join(", ")
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
