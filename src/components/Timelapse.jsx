import { useEffect, useMemo, useRef, useState } from "react";
import {
  getTimelapse,
  getTimelapseDias,
  getTimelapseDetecciones,
  getTimelapseDeteccionesDias,
  abs,
} from "../api";

function hhmmssFromPath(p) {
  if (!p) return "";
  const m = p.match(/_(\d{6})(?:_|\.jpg)/i);
  if (!m) return "";
  const s = m[1];
  return `${s.slice(0, 2)}:${s.slice(2, 4)}:${s.slice(4, 6)}`;
}

export default function Timelapse({
  title = "Cámara",
  canal,
  autoPlay = false,
  mode = "detecciones",
}) {
  const [dias, setDias] = useState([]);
  const [dia, setDia] = useState("");
  const [frames, setFrames] = useState([]);
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(autoPlay);
  const [speedMs, setSpeedMs] = useState(1000);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const timerRef = useRef(null);

  useEffect(() => {
    async function loadDays() {
      try {
        if (mode === "detecciones" && canal) {
          const ds = await getTimelapseDeteccionesDias(canal);
          setDias(ds);
          if (ds?.length && !dia) setDia(ds[ds.length - 1]);
          if (!ds?.length) setDia("");
        } else {
          const ds = await getTimelapseDias();
          setDias(ds);
          if (ds?.length && !dia) setDia(ds[ds.length - 1]);
          if (!ds?.length) setDia("");
        }
      } catch {
        setDias([]);
        setDia("");
      }
    }
    loadDays();
  }, [canal, mode]);

  useEffect(() => {
    if (!dia || !canal) {
      setFrames([]); setIdx(0); setPlaying(false);
      return;
    }
    setLoading(true); setErr("");
    const fetcher =
      mode === "detecciones"
        ? getTimelapseDetecciones(dia, canal)
        : getTimelapse(dia, canal);

    Promise.resolve(fetcher)
      .then((data) => {
        const arr = Array.isArray(data) ? data : [];
        setFrames(arr);
        setIdx(0);
        setPlaying(autoPlay && arr.length > 0);
      })
      .catch(() => {
        setErr(mode === "detecciones"
          ? "No se pudo cargar el timelapse de detecciones."
          : "No se pudo cargar el timelapse.");
        setFrames([]); setIdx(0); setPlaying(false);
      })
      .finally(() => setLoading(false));
  }, [dia, canal, autoPlay, mode]);

  useEffect(() => {
    if (!playing || frames.length === 0) return;
    timerRef.current = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, speedMs);
    return () => clearInterval(timerRef.current);
  }, [playing, frames, speedMs]);

  useEffect(() => {
    if (frames.length === 0) return;
    const next = frames[(idx + 1) % frames.length];
    if (next) { const img = new Image(); img.src = abs(next); }
  }, [idx, frames]);

  const current = useMemo(() => frames[idx] || "", [frames, idx]);
  const hhmmss = useMemo(() => hhmmssFromPath(current), [current]);

  const countBadge = (
    <span className="ml-2 inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
      {frames.length || 0} frames
    </span>
  );

  return (
    <div className="m-3 h-full w-full min-w-[450px] overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3">
        <div className="min-w-0">
          <h3 className="truncate text-[15px] font-semibold text-gray-800">
            {title} <span className="text-gray-400">({canal})</span>
            {countBadge}
          </h3>
          <p className="mt-0.5 text-[12px] uppercase tracking-wide text-gray-400">
            {mode === "detecciones" ? "Detecciones" : "Timelapse general"}
          </p>
        </div>

        {/* Día */}
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
            {mode === "detecciones"
              ? "Sin detecciones para este canal y día."
              : "No hay imágenes aún."}
          </div>
        ) : (
          <>
            {/* Imagen */}
            <div className="relative overflow-hidden rounded-xl ring-1 ring-gray-200">
              <img
                src={abs(current)}
                alt={`Frame ${idx + 1} / ${frames.length}`}
                className="block w-full max-h-[180px] object-cover"
                onError={() => setErr("Imagen no disponible")}
              />
              {hhmmss && (
                <div className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
                  {hhmmss} • {idx + 1}/{frames.length}
                </div>
              )}
            </div>

            {/* Progreso */}
            <input
              type="range"
              min="0"
              max={frames.length - 1}
              value={idx}
              onChange={(e) => setIdx(Number(e.target.value))}
              className="mt-3 w-full accent-blue-600"
            />

            {/* Controles */}
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 items-center">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIdx((i) => Math.max(i - 1, 0))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ⏪ <span className="hidden sm:inline">Anterior</span>
                </button>
                <button
                  onClick={() => setPlaying((p) => !p)}
                  className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700"
                >
                  {playing ? "⏸ Pausa" : "▶ Play"}
                </button>
                <button
                  onClick={() => setIdx((i) => Math.min(i + 1, frames.length - 1))}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  ⏩ <span className="hidden sm:inline">Siguiente</span>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:justify-end">
                <span className="text-xs text-gray-500">Velocidad:</span>
                <select
                  className="rounded-md border border-gray-200 bg-white px-2 py-1 text-sm text-gray-700 focus:border-blue-400 focus:outline-none"
                  value={speedMs}
                  onChange={(e) => setSpeedMs(Number(e.target.value))}
                >
                  <option value={2000}>0.5x</option>
                  <option value={1000}>1x</option>
                  <option value={500}>2x</option>
                  <option value={250}>4x</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
