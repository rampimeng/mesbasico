import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import Sidebar from '@/components/Supervisor/Sidebar';
import DashboardHome from '@/components/Supervisor/DashboardHome';
import OperatorMonitoring from '@/components/Supervisor/OperatorMonitoring';
import RegistrationPage from '@/pages/Admin/RegistrationPage';
import PDCAPage from '@/pages/Admin/PDCAPage';
import AuditPage from '@/pages/Admin/AuditPage';
import { ArrowLeft } from 'lucide-react';

const SupervisorDashboard = () => {
  const { user, company } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Verificar se é acesso Master
  const isMasterAccess = localStorage.getItem('isMasterAccess') === 'true';

  const handleBackToMaster = () => {
    // Restaurar usuário Master original
    const masterUserStr = localStorage.getItem('masterOriginalUser');
    if (masterUserStr) {
      localStorage.setItem('user', masterUserStr);
      localStorage.removeItem('masterOriginalUser');
      localStorage.removeItem('company');
      localStorage.removeItem('isMasterAccess');

      // Redirecionar para o painel Master
      window.location.href = '/master';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Header */}
        <header className="bg-white shadow-md z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {company?.logoUrl && (
                  <img
                    src={company.logoUrl}
                    alt="Logo da Empresa"
                    className="h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Dashboard de {user?.role === 'ADMIN' ? 'Administração' : 'Supervisão'}
                  </h1>
                  <p className="text-gray-600 mt-1">
                    Bem-vindo, <span className="font-semibold">{user?.name}</span>
                    {isMasterAccess && (
                      <span className="ml-2 px-2 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded">
                        Acesso Master
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {isMasterAccess && (
                <button
                  onClick={handleBackToMaster}
                  className="btn-secondary flex items-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Voltar ao Painel Master
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-6 py-6">
            <Routes>
              <Route path="/" element={<DashboardHome />} />
              <Route path="/monitoring" element={<OperatorMonitoring />} />
              {user?.role === 'ADMIN' && (
                <>
                  <Route path="/settings" element={<RegistrationPage />} />
                  {company?.pdcaEnabled && <Route path="/pdca" element={<PDCAPage />} />}
                  <Route path="/audit" element={<AuditPage />} />
                </>
              )}
              <Route path="*" element={<Navigate to={user?.role === 'ADMIN' ? '/admin' : '/supervisor'} replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SupervisorDashboard;
