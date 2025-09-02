import { Routes, Route, Navigate } from "react-router-dom";
import MainLayout from "./MainLayout";
import Dashboard from "../pages/Dashboard";
import Anomalies from "../pages/Anomalies";
import Inventory from "../pages/Inventory";
import Reports from "../pages/Reports";
import Transactions from "../pages/Transactions";
import SettingsPage from "../pages/SettingsPage";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";
import Login from "../pages/Login";

export default function AppRouter() {
  const { initialize, isLoggedIn } = useAuthStore();
  
  useEffect(() => {
    initialize();
  }, [initialize]);

  const ProtectedRoute = ({ children }) => {
    if (!isLoggedIn) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="/anomalies" element={<Anomalies />} />
        <Route path="/inventory" element={<Inventory />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/transactions" element={<Transactions />} />
      </Route>
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}