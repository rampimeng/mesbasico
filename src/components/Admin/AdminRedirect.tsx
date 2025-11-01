import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

/**
 * Componente que redireciona o ADMIN baseado nos módulos habilitados:
 * - Se tiver 0 módulos: mostra mensagem de erro
 * - Se tiver 1 módulo: redireciona direto para o módulo
 * - Se tiver 2+ módulos: mostra página de seleção
 */
const AdminRedirect = () => {
  const { company } = useAuthStore();

  const enabledModules = company?.enabledModules || [];
  const pdcaEnabled = company?.pdcaEnabled || false;
  
  // Contar total de módulos (enabledModules + PDCA se habilitado)
  const totalModules = enabledModules.length + (pdcaEnabled ? 1 : 0);
  
  // Se não tiver módulos, redirecionar para página de seleção (que mostrará mensagem)
  if (totalModules === 0) {
    return <Navigate to="/admin/modules" replace />;
  }

  // Se tiver apenas 1 módulo, redirecionar direto
  if (totalModules === 1) {
    // Se for PDCA e não tiver outros módulos
    if (pdcaEnabled && enabledModules.length === 0) {
      return <Navigate to="/admin/pdca" replace />;
    }
    
    // Senão, pegar o primeiro módulo habilitado
    const module = enabledModules[0];
    
    // Mapear módulo para rota
    const moduleRoutes: Record<string, string> = {
      'MES': '/admin',
      'MANUTENÇÃO': '/admin/maintenance',
    };

    const route = moduleRoutes[module] || '/admin';
    return <Navigate to={route} replace />;
  }

  // Se tiver 2+ módulos, mostrar página de seleção
  return <Navigate to="/admin/modules" replace />;
};

export default AdminRedirect;

