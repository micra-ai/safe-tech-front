import { useState } from "react";
import { useNavigate } from "react-router-dom";  // 👈 importar hook
import { loginUser, registerUser } from "../api";
import { FaUser, FaLock, FaEnvelope } from "react-icons/fa";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate(); // 👈 inicializar navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        const res = await loginUser({ correo, password });
        // ✅ guardar sesión
        localStorage.setItem("user", JSON.stringify(res.user));
        onLogin(res.user);
        navigate("/"); // 👈 redirigir al dashboard
      } else {
        await registerUser({ nombre, correo, password });
        alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
        setMode("login");
      }
    } catch (err) {
      setError("Error en las credenciales o datos inválidos");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-2xl shadow-lg w-96 border border-gray-200 flex flex-col items-center"
      >
        {/* LOGO */}
        <img
          src="/Logo_Syncore_Horizontal_color.png"
          alt="Logo"
          className="w-40 mb-4"
        />

        <h2 className="text-2xl font-bold mb-6 text-center text-[#112d5a]">
          {mode === "login" ? "Iniciar sesión" : "Registrarse"}
        </h2>

        {error && (
          <div className="text-red-600 text-sm mb-4 text-center">{error}</div>
        )}

        {mode === "register" && (
          <div className="flex items-center border rounded-lg mb-4 px-3 w-full">
            <FaUser className="text-gray-400" />
            <input
              type="text"
              placeholder="Nombre completo"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-2 py-2 outline-none text-sm"
            />
          </div>
        )}

        <div className="flex items-center border rounded-lg mb-4 px-3 w-full">
          <FaEnvelope className="text-gray-400" />
          <input
            type="email"
            placeholder="Correo"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            className="w-full px-2 py-2 outline-none text-sm"
          />
        </div>

        <div className="flex items-center border rounded-lg mb-6 px-3 w-full">
          <FaLock className="text-gray-400" />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-2 py-2 outline-none text-sm"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#112d5a] text-white py-2 rounded-lg font-semibold hover:bg-orange-500 transition"
        >
          {mode === "login" ? "Entrar" : "Registrarse"}
        </button>

        <div className="mt-6 text-center text-sm text-gray-600">
          {mode === "login" ? (
            <>
              ¿No tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-orange-500 hover:underline font-medium"
              >
                Registrarse
              </button>
            </>
          ) : (
            <>
              ¿Ya tienes cuenta?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-orange-500 hover:underline font-medium"
              >
                Iniciar sesión
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
