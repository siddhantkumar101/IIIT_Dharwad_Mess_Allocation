import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";

import LoginPage from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import StudentDashboard from "./pages/StudentDashboard";
import MessDashboard from "./pages/MessDashboard";
import AdminDashboard from "./pages/AdminDashboard";

// Root redirect handler
const RootRedirect = () => {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "mess1") return <Navigate to="/mess1" replace />;
  if (user.role === "mess2") return <Navigate to="/mess2" replace />;
  return <Navigate to="/student" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Portals */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mess1"
            element={
              <ProtectedRoute allowedRoles={["mess1", "admin"]}>
                <MessDashboard forcedMess="mess1" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/mess2"
            element={
              <ProtectedRoute allowedRoles={["mess2", "admin"]}>
                <MessDashboard forcedMess="mess2" />
              </ProtectedRoute>
            }
          />

          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Root and Fallback */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
