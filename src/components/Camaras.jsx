import { useEffect, useRef } from "react";
import Hls from "hls.js";

// ⚠️ Ponemos la IP local del PC faena
const API_URL_STREAM = "http://192.168.1.34:5000";

export default function Camaras() {
  const camaras = [
    { id: "channel1", title: "Cámara 1" },
    { id: "channel2", title: "Cámara 2" },
    { id: "channel3", title: "Cámara 3" },
    { id: "channel4", title: "Cámara 4" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Cámaras en vivo</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {camaras.map((cam) => (
          <VideoPlayer
            key={cam.id}
            url={`${API_URL_STREAM}/stream/${cam.id}/index.m3u8`}
            title={cam.title}
          />
        ))}
      </div>
    </div>
  );
}

function VideoPlayer({ url, title }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
      videoRef.current.src = url;
    }
  }, [url]);

  return (
    <div className="bg-black rounded-lg overflow-hidden">
      <div className="bg-gray-900 text-white px-4 py-2 font-semibold">
        {title}
      </div>
      <video
        ref={videoRef}
        controls
        autoPlay
        muted
        className="w-full h-64 object-cover"
      />
    </div>
  );
}
