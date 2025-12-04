// src/pages/Camaras.jsx  (ajusta el nombre al que tengas)

export default function Camaras() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Cámaras</h1>

      <div className="bg-white rounded-2xl shadow p-6">
        <h2 className="text-lg font-semibold mb-2">
          Módulo de cámaras en vivo deshabilitado
        </h2>
        <p className="text-gray-600 text-sm">
          Por ahora el monitoreo en vivo está desactivado. 
          Puedes seguir revisando el <span className="font-semibold">Timelapse</span> 
          y las <span className="font-semibold">Alertas</span> para ver las detecciones 
          con EPP.
        </p>
      </div>
    </div>
  );
}














