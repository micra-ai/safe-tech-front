import { useEffect, useState } from "react";
import API_URL from "../api";

export default function Detecciones() {
  const [detecciones, setDetecciones] = useState([]);
  const [canal, setCanal] = useState("Channel2");
  const [fecha, setFecha] = useState(
    new Date().toISOString().slice(0, 10) // fecha actual por defecto
  );

  useEffect(() => {
    const fetchDetecciones = async () => {
      try {
        const res = await fetch(
          `${API_URL}/detecciones/timelapse?canal=${canal}&fecha=${fecha}`
        );
        const data = await res.json();
        setDetecciones(data);
      } catch (err) {
        console.error("Error al cargar detecciones:", err);
      }
    };

    fetchDetecciones();
  }, [canal, fecha]);

  return (
    <div className="bg-white p-4 rounded shadow my-4">
      <h2 className="text-xl font-bold mb-4">📸 Detecciones Guardadas</h2>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <select
          value={canal}
          onChange={(e) => setCanal(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          <option value="Channel1">Canal 1</option>
          <option value="Channel2">Canal 2</option>
          <option value="Channel3">Canal 3</option>
          <option value="Channel4">Canal 4</option>
        </select>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border px-2 py-1 rounded"
        />
      </div>

      {detecciones.length === 0 ? (
        <p className="text-gray-500">No hay detecciones disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {detecciones.map((d, idx) => (
            <div key={idx} className="border rounded-lg overflow-hidden shadow-sm">
              <img
                src={`${API_URL}${d.imagen}`}
                alt="Detección"
                className="w-full h-48 object-cover"
              />
              <div className="p-2 text-sm text-gray-700">
                <p><strong>Canal:</strong> {d.canal}</p>
                <p><strong>Hora:</strong> {d.timestamp}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
