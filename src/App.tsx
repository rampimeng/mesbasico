import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

// Pages
import LoginPage from '@/pages/LoginPage';
import MasterDashboard from '@/pages/Master/MasterDashboard';
import AppLogoSettings from '@/pages/Master/AppLogoSettings';
import AdminDashboard from '@/pages/Admin/AdminDashboard';
import SupervisorDashboard from '@/pages/Supervisor/SupervisorDashboard';
import OperatorDashboard from '@/pages/Operator/OperatorDashboard';
import ControlDashboard from '@/pages/ControlDashboard';
import ModuleSelectionPage from '@/pages/Admin/ModuleSelectionPage';

// Components
import ProtectedRoute from '@/components/ProtectedRoute';
import AdminRedirect from '@/components/Admin/AdminRedirect';

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

      <Route path="/master">
        <Route
          index
          element={
            <ProtectedRoute allowedRoles={[UserRole.MASTER]}>
              <MasterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="app-logo"
          element={
            <ProtectedRoute allowedRoles={[UserRole.MASTER]}>
              <AppLogoSettings />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <AdminRedirect />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/modules"
        element={
          <ProtectedRoute allowedRoles={[UserRole.ADMIN]}>
            <ModuleSelectionPage />
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
