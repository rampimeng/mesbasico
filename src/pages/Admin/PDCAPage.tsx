import { useEffect } from 'react';
import { Plus, ClipboardList, TrendingUp, CheckCircle2, Target } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { usePDCAStore } from '@/store/pdcaStore';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';

const PDCAPage = () => {
  const navigate = useNavigate();
  const company = useAuthStore((state) => state.company);
  const plans = usePDCAStore((state) => state.getPlans(company?.id || ''));
  const initializeMockData = usePDCAStore((state) => state.initializeMockData);

  useEffect(() => {
    initializeMockData();
  }, [initializeMockData]);

  const getPhaseIcon = (phase: string) => {
    switch (phase) {
      case 'PLAN':
        return <Target className="w-5 h-5" />;
      case 'DO':
        return <TrendingUp className="w-5 h-5" />;
      case 'CHECK':
        return <ClipboardList className="w-5 h-5" />;
      case 'ACT':
        return <CheckCircle2 className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'PLAN':
        return 'bg-blue-100 text-blue-800';
      case 'DO':
        return 'bg-yellow-100 text-yellow-800';
      case 'CHECK':
        return 'bg-purple-100 text-purple-800';
      case 'ACT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPhaseLabel = (phase: string) => {
    const labels = {
      PLAN: 'Planejar',
      DO: 'Executar',
      CHECK: 'Verificar',
      ACT: 'Agir',
    };
    return labels[phase as keyof typeof labels] || phase;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">PDCA - Melhoria Contínua</h1>
          <p className="text-gray-600 mt-1">
            Gerencie planos de ação para melhoria contínua
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {['PLAN', 'DO', 'CHECK', 'ACT'].map((phase) => {
            const count = plans.filter((p) => p.phase === phase).length;
            return (
              <div key={phase} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{getPhaseLabel(phase)}</p>
                    <p className="text-2xl font-bold text-gray-900">{count}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${getPhaseColor(phase)}`}>
                    {getPhaseIcon(phase)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Planos PDCA</h2>
              <p className="text-sm text-gray-600 mt-1">
                {plans.length} {plans.length === 1 ? 'plano ativo' : 'planos ativos'}
              </p>
            </div>
            <button
              onClick={() => navigate('/admin/pdca/new')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Novo Plano PDCA
            </button>
          </div>
        </div>

        {/* Lista de Planos */}
        <div className="grid gap-4">
          {plans.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
              <div className="max-w-md mx-auto">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Nenhum plano PDCA cadastrado
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro plano de melhoria contínua para começar a acompanhar resultados.
                </p>
                <button
                  onClick={() => navigate('/admin/pdca/new')}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                  Criar Primeiro Plano
                </button>
              </div>
            </div>
          ) : (
            plans.map((plan) => (
              <div
                key={plan.id}
                onClick={() => navigate(`/admin/pdca/${plan.id}`)}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900">{plan.title}</h3>
                      <span className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getPhaseColor(plan.phase)}`}>
                        {getPhaseIcon(plan.phase)}
                        {getPhaseLabel(plan.phase)}
                      </span>
                    </div>
                    {plan.description && (
                      <p className="text-gray-600 mb-3">{plan.description}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Período Base:</span>
                    <p className="font-medium text-gray-900">
                      {format(new Date(plan.basePeriodStart), 'dd/MM/yyyy')} - {format(new Date(plan.basePeriodEnd), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Ações:</span>
                    <p className="font-medium text-gray-900">
                      {plan.actions.filter((a) => a.completed).length}/{plan.actions.length} concluídas
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Meta Ciclos:</span>
                    <p className="font-medium text-gray-900">{plan.targets.targetCycles || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Criado em:</span>
                    <p className="font-medium text-gray-900">
                      {format(new Date(plan.createdAt), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PDCAPage;
