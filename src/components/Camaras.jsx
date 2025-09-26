import { useEffect, useRef } from "react";
import Hls from "hls.js";
import API_URL from "../api";   // 👈 se importa como default, sin {}

function VideoPlayer({ channel, title }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current) {
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(`${API_URL}/stream/${channel}/index.m3u8`);
        hls.attachMedia(videoRef.current);
      } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
        videoRef.current.src = `${API_URL}/stream/${channel}/index.m3u8`;
      }
    }
  }, [channel]);

  return (
    <div className="bg-black rounded-lg overflow-hidden shadow">
      <video ref={videoRef} controls autoPlay muted className="w-full h-64" />
      <div className="p-2 text-center text-white bg-gray-800">{title}</div>
    </div>
  );
}

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
          <VideoPlayer key={cam.id} channel={cam.id} title={cam.title} />
        ))}
      </div>
    </div>
  );
}
















