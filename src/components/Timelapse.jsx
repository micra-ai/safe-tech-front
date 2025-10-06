import { useEffect, useMemo, useRef, useState } from "react";
import {
  getTimelapseDetecciones,
  getTimelapseDeteccionesDias,
} from "../api";

const API_URL = "https://techsyncore.duckdns.org";

// Convierte ruta relativa en absoluta
function abs(p) {
  if (!p) return "";
  if (p.startsWith("http")) return p;
  return `${API_URL}/${p.replace(/^\//, "")}`;
}

// Extrae hora desde el nombre del archivo
function hhmmssFromPath(p) {
  if (!p) return "";
  const m = p.match(/_(\d{6})(?:_|\.jpg)/i);
  if (!m) return "";
  const s = m[1];
  return `${s.slice(0, 2)}:${s.slice(2, 4)}:${s.slice(4, 6)}`;
}

function TimelapseCamara({ title, canal }) {
  const [dias, setDias] = useState([]);
  const [dia, setDia] = useState("");
  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speedMs, setSpeedMs] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  // Cargar días
  useEffect(() => {
    async function loadDays() {
      try {
        if (canal) {
          const ds = await getTimelapseDeteccionesDias(canal);
          setDias(Array.isArray(ds) ? ds : []);
          if (ds?.length && !dia) setDia(ds[ds.length - 1]);
          if (!ds?.length) setDia("");
        }
      } catch {
        setDias([]);
        setDia("");
      }
    }
    loadDays();
  }, [canal]);

  // Cargar imágenes
  useEffect(() => {
    if (!dia || !canal) {
      setFrames([]); setIdx(0); setPlaying(false);
      return;
    }
    setLoading(true); setErr("");

    Promise.resolve(getTimelapseDetecciones(dia, canal))
      .then((data) => {
        const arr = Array.isArray(data) ? data.map((p) => abs(p)) : [];
        setFrames(arr);
        setIdx(0);
        setPlaying(arr.length > 0);
      })
      .catch(() => {
        setErr("No se pudo cargar el timelapse de detecciones.");
        setFrames([]); setIdx(0); setPlaying(false);
      })
      .finally(() => setLoading(false));
  }, [dia, canal]);

  // Reproducción automática
  useEffect(() => {
    if (!playing || frames.length === 0) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, speedMs);
    return () => clearInterval(timerRef.current);
  }, [playing, frames, speedMs]);

  const current = useMemo(() => frames[idx] || "", [frames, idx]);
  const hhmmss = useMemo(() => hhmmssFromPath(current), [current]);

  return (
    <div className="m-3 h-full w-full min-w-[450px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-gray-800">
            {title} <span className="text-gray-400">({canal})</span>
          </h3>
        </div>
        <div className="shrink-0">
          <select
            className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-sm text-gray-700 focus:border-blue-400 focus:bg-white focus:outline-none"
            value={dia}
            onChange={(e) => setDia(e.target.value)}
          >
            <option value="">{dias.length ? "Selecciona un día" : "Sin días"}</option>
            {dias.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 pb-4 pt-3">
        {loading ? (
          <div className="flex h-40 items-center justify-center text-gray-500 text-sm">
            Cargando…
          </div>
        ) : err ? (
          <div className="flex h-40 items-center justify-center text-red-600 text-sm">
            {err}
          </div>
        ) : !dia ? (
          <div className="flex h-40 items-center justify-center text-gray-500 text-sm">
            Selecciona un día.
          </div>
        ) : frames.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-gray-500 text-sm">
            Sin detecciones para este canal y día.
          </div>
        ) : (
          <>
            <div className="relative overflow-hidden rounded-xl ring-1 ring-gray-200">
              <img
                src={current}
                alt={`Frame ${idx + 1} / ${frames.length}`}
                className="block w-full max-h-[180px] object-cover"
              />
              {hhmmss && (
                <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                  {hhmmss} • {idx + 1}/{frames.length}
                </div>
              )}
            </div>

            <input
              type="range"
              min="0"
              max={frames.length - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="mt-3 w-full accent-blue-600"
            />

            <div className="mt-2 flex justify-between">
              <div className="flex gap-2">
                <button
                  onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ⏪
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="rounded-lg bg-blue-600 px-3 py-1 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {playing ? "⏸" : "▶"}
                </button>
                <button
                  onClick={() => setIdx((i) => Math.min(i + 1, frames.length - 1))}
                  className="rounded-lg border border-gray-200 bg-white px-3 py-1 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ⏩
                </button>
              </div>

              <select
                className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700"
                value={speedMs}
                onChange={(e) => setSpeedMs(Number(e.target.value))}
              >
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
              </select>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function Timelapse() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Timelapse de Cámaras</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TimelapseCamara title="Cámara 1" canal="Channel1" />
        <TimelapseCamara title="Cámara 2" canal="Channel2" />
        <TimelapseCamara title="Cámara 3" canal="Channel3" />
        <TimelapseCamara title="Cámara 4" canal="Channel4" />
      </div>
    </div>
  );
}
