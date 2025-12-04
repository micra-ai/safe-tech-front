// src/pages/Login.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../api";

export default function Login({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true); // ✅ recordar correo
  const [error, setError] = useState("");

  const navigate = useNavigate();

  // 1) Prefill del correo recordado
  useEffect(() => {
    const remembered = localStorage.getItem("remember_email");
    if (remembered) {
      setCorreo(remembered);
    }
  }, []);

  // 2) Si ya hay usuario en localStorage → entrar directo al dashboard
  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw || raw === "undefined" || raw === "null") return;

      const savedUser = JSON.parse(raw);
      if (savedUser) {
        onLogin(savedUser);
        navigate("/");
      }
    } catch {
      // si está corrupto, lo limpiamos
      localStorage.removeItem("user");
    }
  }, [onLogin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (mode === "login") {
        // ===== LOGIN =====
        const res = await loginUser({ correo, password });

        if (!res || !res.user) {
          throw new Error("Respuesta inválida del servidor");
        }

        // ✅ guardar sesión completa
        localStorage.setItem("user", JSON.stringify(res.user));

        // ✅ recordar o no el correo
        if (remember) {
          localStorage.setItem("remember_email", correo);
        } else {
          localStorage.removeItem("remember_email");
        }

        onLogin(res.user);
        navigate("/");
      } else {
        // ===== REGISTRO =====
        const res = await registerUser({ nombre, correo, password });

        // Si tu backend devuelve el usuario al registrar,
        // lo usamos para dejar sesión iniciada.
        if (res && res.user) {
          localStorage.setItem("user", JSON.stringify(res.user));
          if (remember) {
            localStorage.setItem("remember_email", correo);
          } else {
            localStorage.removeItem("remember_email");
          }
          onLogin(res.user);
          navigate("/");
        } else {
          // Si no devuelve user, seguimos con flujo clásico
          alert("Usuario registrado correctamente. Ahora puedes iniciar sesión.");
          setMode("login");
        }
      }
    } catch (err) {
      console.error(err);
      setError("Error en las credenciales o en los datos enviados.");
    }
  };

  const toggleMode = () => {
    setMode((prev) => (prev === "login" ? "register" : "login"));
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white shadow-xl rounded-2xl px-10 py-8 w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="/logo-syncore.png"
            alt="Syncore"
            className="h-10 object-contain"
          />
        </div>

        {/* Título */}
        <h1 className="text-2xl font-bold text-center text-[#112d5a] mb-2">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h1>

        {mode === "login" ? (
          <p className="text-center text-sm text-gray-500 mb-6">
            Ingresa tus credenciales para acceder al dashboard.
          </p>
        ) : (
          <p className="text-center text-sm text-gray-500 mb-6">
            Registra un nuevo usuario para usar el sistema.
          </p>
        )}

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo nombre solo en registro */}
          {mode === "register" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#112d5a33]"
                placeholder="Nombre completo"
                required
              />
            </div>
          )}

          {/* Correo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Correo
            </label>
            <input
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#112d5a33]"
              placeholder="correo@empresa.cl"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#112d5a33]"
              placeholder="********"
              required
            />
          </div>

          {/* Recordarme (solo login) */}
          {mode === "login" && (
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="rounded border-gray-300"
                />
                Recordar correo en este equipo
              </label>
            </div>
          )}

          {/* Botón principal */}
          <button
            type="submit"
            className="w-full bg-[#112d5a] text-white py-2.5 rounded-lg font-semibold text-sm hover:bg-[#0b1f3d] transition"
          >
            {mode === "login" ? "Entrar" : "Registrarse"}
          </button>
        </form>

        {/* Cambio login/registro */}
        <p className="mt-4 text-center text-sm text-gray-600">
          {mode === "login" ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}{" "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-orange-500 font-semibold hover:underline"
          >
            {mode === "login" ? "Registrarse" : "Iniciar sesión"}
          </button>
        </p>
      </div>
    </div>
  );
}
