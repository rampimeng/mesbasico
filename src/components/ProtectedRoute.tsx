import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirecionar para a página apropriada baseada no role
    switch (user.role) {
      case UserRole.MASTER:
        return <Navigate to="/master" replace />;
      case UserRole.ADMIN:
        return <Navigate to="/admin" replace />;
      case UserRole.SUPERVISOR:
        return <Navigate to="/supervisor" replace />;
      case UserRole.OPERATOR:
        return <Navigate to="/operator" replace />;
      default:
        return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
