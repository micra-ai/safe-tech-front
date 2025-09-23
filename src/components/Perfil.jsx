import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logoutUser } from "../api";

export default function Perfil({ onLogout }) {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    localStorage.removeItem("user"); // ✅ limpiar sesión local
    onLogout();                      // ✅ actualizar estado global en App.jsx
    navigate("/login");              // ✅ redirigir al login
  };

  if (!user) return <div className="p-4">Cargando perfil...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Mi perfil</h2>
      <div className="space-y-3 text-sm">
        <div>
          <span className="font-semibold">Nombre:</span> {user.nombre}
        </div>
        <div>
          <span className="font-semibold">Correo:</span> {user.correo}
        </div>
        <div>
          <span className="font-semibold">Rol:</span> {user.rol}
        </div>
        <div>
          <span className="font-semibold">Última sesión:</span>{" "}
          {user.ultima_sesion}
        </div>
      </div>
      <div className="mt-6">
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  );
}
