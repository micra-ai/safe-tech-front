import { Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

import Sidebar from "./components/Sidebar";
import Header from "./components/Header";
import StatsCards from "./components/StatsCards";
import Graphs from "./components/Graphs";
import Perfil from "./components/Perfil";
import Alerts from "./components/Alerts";
import Timelapse from "./components/Timelapse";
import ReportesAlertas from "./components/ReportesAlertas";
import Login from "./components/Login";
import Usuarios from "./components/Usuarios";

/* ---------- Vistas ---------- */
function Inicio() {
  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <section
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
      >
        <StatsCards />
      </section>

      {/* Gráficas */}
      <section
        className="grid gap-6"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}
      >
        <Graphs />
      </section>
    </div>
  );
}

function AlertasView() {
  return <Alerts />;
}

function ReportesView() {
  return <ReportesAlertas />;
}

function TimelapseView() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-6">Timelapse de Cámaras</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-12">
        <Timelapse title="Cámara 1" canal="Channel1" mode="detecciones" autoPlay />
        <Timelapse title="Cámara 2" canal="Channel2" mode="detecciones" autoPlay />
        <Timelapse title="Cámara 3" canal="Channel3" mode="detecciones" autoPlay />
        <Timelapse title="Cámara 4" canal="Channel4" mode="detecciones" autoPlay />
      </div>
    </div>
  );
}

/* ---------- App principal ---------- */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restaurar sesión desde localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="p-6">Cargando...</div>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      {user && <Sidebar user={user} onLogout={() => setUser(null)} />}


      <main className="flex-1 flex flex-col gap-6 p-6 bg-gray-50 md:ml-64">
        {user && <Header user={user} />}

        <Routes>
          {/* Rutas protegidas */}
          <Route
            path="/"
            element={user ? <Inicio /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/alertas"
            element={user ? <AlertasView /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/perfil"
            element={
              user ? (
                <Perfil onLogout={() => setUser(null)} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/timelapse"
            element={user ? <TimelapseView /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/reportes"
            element={user ? <ReportesView /> : <Navigate to="/login" replace />}
          />

          {/* Solo admin */}
          <Route
            path="/usuarios"
            element={
              user && user.rol === "admin" ? (
                <Usuarios />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />

          {/* Login público */}
          <Route
  path="/login"
  element={<Login onLogin={setUser} />}
/>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
