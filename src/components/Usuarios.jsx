import { useEffect, useState } from "react";
import { getUsuarios, deleteUsuario } from "../api";

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("¿Seguro que quieres eliminar este usuario?")) return;
    try {
      await deleteUsuario(id);
      setUsuarios(usuarios.filter((u) => u.id !== id));
    } catch (err) {
      alert("Error eliminando usuario");
    }
  };

  if (loading) return <div className="p-4">Cargando usuarios...</div>;

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <h2 className="text-lg font-semibold mb-4">Gestión de Usuarios</h2>

      <table className="w-full text-sm border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Correo</th>
            <th className="p-2 border">Rol</th>
            <th className="p-2 border">Última sesión</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {usuarios.map((u) => (
            <tr key={u.id} className="border-t">
              <td className="p-2 border">{u.id}</td>
              <td className="p-2 border">{u.nombre}</td>
              <td className="p-2 border">{u.correo}</td>
              <td className="p-2 border">{u.rol}</td>
              <td className="p-2 border">{u.ultima_sesion || "-"}</td>
              <td className="p-2 border text-center">
                <button
                  onClick={() => handleDelete(u.id)}
                  className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-xs"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
          {usuarios.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center p-4 text-gray-500">
                No hay usuarios registrados.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
