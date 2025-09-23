import { useState, useEffect } from "react";

export default function Camaras() {
  // Lista de canales (puedes cambiarlos según tu backend)
  const [camaras] = useState([
    { id: "Channel1", title: "Cámara 1" },
    { id: "Channel2", title: "Cámara 2" },
    { id: "Channel3", title: "Cámara 3" },
    { id: "Channel4", title: "Cámara 4" },
  ]);

  // Aquí puedes poner el endpoint de tu backend que expone el stream de cada cámara
  const API_URL = import.meta.env.VITE_API_URL || "https://backend-camaras.onrender.com";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Cámaras en vivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camaras.map((cam) => (
          <div key={cam.id} className="bg-black rounded-xl shadow-lg overflow-hidden">
            <div className="bg-gray-900 text-white px-4 py-2 font-semibold">{cam.title}</div>
            {/* Stream de video (backend debe devolver mjpeg/mp4/hls) */}
            <video
              src={`${API_URL}/stream/${cam.id}`} // ⚡ tu backend debe entregar el stream en esta ruta
              controls
              autoPlay
              muted
              className="w-full h-64 object-cover bg-gray-800"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
