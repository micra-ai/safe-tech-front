import { useEffect, useRef } from "react";
import Hls from "hls.js";

function VideoPlayer({ title, url }) {
  const videoRef = useRef();

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
    <div className="bg-[#0d1b2a] rounded-lg overflow-hidden shadow">
      <div className="bg-[#1c3b6c] px-4 py-2 font-semibold text-white">
        {title}
      </div>
      <video ref={videoRef} controls autoPlay muted className="w-full h-64 bg-black" />
    </div>
  );
}

export default function Camaras() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Cámaras en vivo</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VideoPlayer title="Cámara 1" url="https://backend-camaras.onrender.com/stream/channel1.m3u8" />
        <VideoPlayer title="Cámara 2" url="https://backend-camaras.onrender.com/stream/channel2.m3u8" />
        <VideoPlayer title="Cámara 3" url="https://backend-camaras.onrender.com/stream/channel3.m3u8" />
        <VideoPlayer title="Cámara 4" url="https://backend-camaras.onrender.com/stream/channel4.m3u8" />
      </div>
    </div>
  );
}
