import { useState } from "react";

export default function Camaras() {
  const [camaras] = useState([
    { id: "Channel1", title: "Cámara 1" },
    { id: "Channel2", title: "Cámara 2" },
    { id: "Channel3", title: "Cámara 3" },
    { id: "Channel4", title: "Cámara 4" },
  ]);

  // Detecta si estamos en red local (IP privada)
  const isLocalNetwork =
    window.location.hostname.startsWith("192.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("172.");

  // Elige la URL según dónde estemos
  const API_URL = isLocalNetwork
    ? import.meta.env.VITE_API_URL_LOCAL
    : import.meta.env.VITE_API_URL;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Cámaras en vivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camaras.map((cam) => (
          <div
            key={cam.id}
            className="bg-black rounded-xl shadow-lg overflow-hidden"
          >
            <div className="bg-gray-900 text-white px-4 py-2 font-semibold">
              {cam.title}
            </div>
            <video
              controls
              autoPlay
              muted
              playsInline
              className="w-full h-64 object-cover bg-gray-800"
            >
              <source
                src={`${API_URL}/streams/${cam.id}.m3u8`}
                type="application/x-mpegURL"
              />
              Tu navegador no soporta video HLS.
            </video>
          </div>
        ))}
      </div>
    </div>
  );
}
