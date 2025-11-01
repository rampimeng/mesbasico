import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { Settings, Wrench, TrendingUp, Building2 } from 'lucide-react';

interface ModuleInfo {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  path: string;
}

const ModuleSelectionPage = () => {
  const navigate = useNavigate();
  const { company, user } = useAuthStore();

  // Definir informações dos módulos disponíveis
  const availableModules: Record<string, ModuleInfo> = {
    MES: {
      id: 'MES',
      name: 'Módulo MES',
      description: 'Gestão de Produção e Chão de Fábrica',
      icon: Settings,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 hover:bg-blue-100',
      path: '/admin',
    },
    MANUTENÇÃO: {
      id: 'MANUTENÇÃO',
      name: 'Módulo de Manutenção',
      description: 'Gestão da Manutenção Industrial',
      icon: Wrench,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 hover:bg-purple-100',
      path: '/admin/maintenance',
    },
    PDCA: {
      id: 'PDCA',
      name: 'PDCA',
      description: 'Plan-Do-Check-Act - Melhoria Contínua',
      icon: TrendingUp,
      color: 'text-green-600',
      bgColor: 'bg-green-50 hover:bg-green-100',
      path: '/admin/pdca',
    },
  };

  // Obter módulos habilitados
  const enabledModules = company?.enabledModules || [];
  const pdcaEnabled = company?.pdcaEnabled || false;
  
  // Filtrar apenas módulos que existem no sistema
  let modules = enabledModules
    .map((moduleId) => availableModules[moduleId])
    .filter((module): module is ModuleInfo => module !== undefined);
  
  // Adicionar PDCA se estiver habilitado
  if (pdcaEnabled && availableModules.PDCA) {
    modules.push(availableModules.PDCA);
  }

  // Se não for ADMIN, redirecionar
  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      navigate('/admin');
    }
  }, [user, navigate]);

  // Se tiver apenas 1 módulo, redirecionar direto
  useEffect(() => {
    if (modules.length === 1) {
      navigate(modules[0].path);
    }
  }, [modules, navigate]);

  const handleModuleClick = (module: ModuleInfo) => {
    navigate(module.path);
  };

  // Se não tiver módulos habilitados ou não for admin
  if (modules.length === 0 || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Nenhum módulo habilitado
          </h2>
          <p className="text-gray-600">
            Entre em contato com o administrador do sistema para habilitar módulos.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Selecione um Módulo</h1>
              <p className="text-gray-600 mt-1">
                Escolha o módulo que deseja acessar
              </p>
            </div>
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
              <button
                onClick={() => navigate('/admin/modules')}
                className="text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                Voltar à Seleção
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Bem-vindo, {user?.name}!
          </h2>
          <p className="text-gray-600 text-lg">
            Você tem acesso a {modules.length} {modules.length === 1 ? 'módulo' : 'módulos'}
          </p>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className={`${module.bgColor} rounded-xl p-8 text-left transition-all duration-200 transform hover:scale-105 hover:shadow-xl border-2 border-transparent hover:border-gray-200`}
              >
                <div className="flex flex-col items-start">
                  <div className={`${module.color} mb-4`}>
                    <IconComponent className="w-12 h-12" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {module.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {module.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span>Acessar</span>
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-start gap-4">
            <Building2 className="w-6 h-6 text-primary-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">
                Sobre os Módulos
              </h3>
              <p className="text-gray-600 text-sm">
                Cada módulo oferece funcionalidades específicas para sua empresa. 
                Você pode alternar entre os módulos a qualquer momento através desta página.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ModuleSelectionPage;

