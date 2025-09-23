export default function Header({ user }) {
  const hora = new Date().getHours();

  let saludo;
  if (hora < 12) saludo = "Buenos días";
  else if (hora < 18) saludo = "Buenas tardes";
  else saludo = "Buenas noches";

  return (
    <header className="flex justify-between items-center">
      {/* Texto de bienvenida dinámico */}
      <div>
        <h1 className="text-2xl font-bold text-[#112d5a]">
          {saludo} {user?.nombre || "Usuario"}
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString("es-ES", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Solo notificaciones */}
      <div className="flex items-center gap-4">
        <div className="relative cursor-pointer">
          <span className="text-2xl">🔔</span>
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            1
          </span>
        </div>
      </div>
    </header>
  );
}
