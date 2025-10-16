import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

// Pages
import LoginPage from '@/pages/LoginPage';
import MasterDashboard from '@/pages/Master/MasterDashboard';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import SupervisorDashboard from '@/pages/Supervisor/SupervisorDashboard';
import OperatorDashboard from '@/pages/Operator/OperatorDashboard';
import ControlDashboard from '@/pages/ControlDashboard';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rota pública para Dashboard de Controle */}
      <Route path="/control/:token" element={<ControlDashboard />} />

      <Route
        path="/master/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.MASTER]}>
            <MasterDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/supervisor/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.SUPERVISOR, UserRole.ADMIN]}>
            <SupervisorDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/operator/*"
        element={
          <ProtectedRoute allowedRoles={[UserRole.OPERATOR]}>
            <OperatorDashboard />
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
