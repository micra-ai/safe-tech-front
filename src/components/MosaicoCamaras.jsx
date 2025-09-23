import { useEffect, useState } from "react";
import { getTimelapseDeteccionesDias, getTimelapseDetecciones } from "../api";

export default function MosaicoCamaras({ canal = "Channel1" }) {
  const [imagenes, setImagenes] = useState([]);
  const [dia, setDia] = useState("");
  const [index, setIndex] = useState(0);

  // 🔹 Cargar días disponibles
  useEffect(() => {
    async function cargarDias() {
      const dias = await getTimelapseDeteccionesDias(canal);
      if (dias.length > 0) {
        setDia(dias[dias.length - 1]); // último día
      }
    }
    cargarDias();
  }, [canal]);

  // 🔹 Cargar imágenes del día
  useEffect(() => {
    if (!dia) return;
    async function cargarFrames() {
      const frames = await getTimelapseDetecciones(dia, canal);
      setImagenes(frames);
    }
    cargarFrames();

    // refrescar cada 5 segundos
    const interval = setInterval(cargarFrames, 5000);
    return () => clearInterval(interval);
  }, [dia, canal]);

  // 🔹 Cambiar frame cada 1 segundo
  useEffect(() => {
    if (imagenes.length === 0) return;
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % imagenes.length);
    }, 1000);
    return () => clearInterval(interval);
  }, [imagenes]);

  return (
    <div className="p-4 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-white text-lg mb-2">{canal} - {dia}</h2>
      {imagenes.length > 0 ? (
        <img
          src={imagenes[index]}
          alt="detección"
          className="w-full rounded-lg border border-gray-700"
        />
      ) : (
        <p className="text-gray-400">No hay imágenes disponibles</p>
      )}
    </div>
  );
}
