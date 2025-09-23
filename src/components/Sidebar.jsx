import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaFileAlt, FaVideo, FaUsers, FaSignOutAlt } from "react-icons/fa";
import { logoutUser } from "../api";

export default function Sidebar({ user, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async (e) => {
    e.preventDefault();
    await logoutUser().catch(() => {});
    localStorage.removeItem("user");
    if (onLogout) onLogout();
    navigate("/login", { replace: true });
  };

  if (!user) return null;

  const menuItems = [
    { to: "/", label: "Inicio", icon: <FaHome /> },
    { to: "/alertas", label: "Alertas", icon: <FaBell /> },
    { to: "/reportes", label: "Reportes", icon: <FaFileAlt /> },
    { to: "/timelapse", label: "Timelapse", icon: <FaVideo /> },
  ];

  if (user?.rol === "admin") {
    menuItems.push({ to: "/usuarios", label: "Usuarios", icon: <FaUsers /> });
  }

  return (
    <div className="bg-[#0d1b2a] text-white w-64 flex flex-col justify-between p-5 fixed h-full shadow-xl">
      {/* Logo */}
      {/* Logo */}
<div className="flex items-center justify-center mb-8">
  <div className="bg-white rounded-lg p-3 shadow-md">
    <img
      src="/Logo_Syncore_Horizontal_color.png"
      alt="Logo"
      className="w-40"
    />
  </div>
      </div>

      {/* Menú */}
      <nav className="flex-1 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all ${
              location.pathname === item.to
                ? "bg-[#1c3b6c] text-white shadow-md"
                : "hover:bg-[#1c3b6c] hover:shadow"
            }`}
          >
            {item.icon} <span className="font-medium">{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Footer con usuario */}
      <div className="mt-6 border-t border-gray-700 pt-4">
        <div className="flex items-center gap-3 mb-4">
          {/* Avatar inicial con circulo */}
          <div className="w-10 h-10 rounded-full bg-[#1c3b6c] flex items-center justify-center font-bold uppercase">
            {user?.nombre?.[0] || "U"}
          </div>
          <div>
            <span className="block font-semibold text-sm">{user?.nombre}</span>
            <span className="text-gray-400 text-xs">{user?.rol}</span>
          </div>
        </div>

        {/* Botón cerrar sesión */}
        <button
          type="button"
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-2 rounded-xl transition-all font-medium"
        >
          <FaSignOutAlt /> Cerrar sesión
        </button>
      </div>
    </div>
  );
}
