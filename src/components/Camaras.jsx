import { useEffect, useRef } from "react";
import Hls from "hls.js";
import { API_URL } from "../api";

const API_URL = import.meta.env.VITE_API_URL;

function VideoPlayer({ channel, title }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    const url = `${API_URL}/stream/${channel}/index.m3u8`;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(video);
    } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = url;
    }
  }, [channel]);

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden shadow">
      <div className="px-4 py-2 font-bold text-white bg-gray-800">{title}</div>
      <video ref={videoRef} controls autoPlay muted className="w-full h-64" />
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
          <VideoPlayer
            key={cam.id}
            channel={cam.id}   // ✅ usa channel, no url
            title={cam.title}
          />
        ))}
      </div>
    </div>
  );
}
