import { useState, useEffect } from 'react';
import { Users, Factory, Grid3x3, AlertTriangle, Clock } from 'lucide-react';
import { useRegistrationStore } from '@/store/registrationStore';
import { useAuthStore } from '@/store/authStore';
import OperatorsList from '@/components/Admin/Registration/OperatorsList';
import MachinesList from '@/components/Admin/Registration/MachinesList';
import GroupsList from '@/components/Admin/Registration/GroupsList';
import ShiftsList from '@/components/Admin/Registration/ShiftsList';
import StopReasonsList from '@/components/Admin/Registration/StopReasonsList';

type TabType = 'operators' | 'machines' | 'groups' | 'shifts' | 'stopReasons';

const RegistrationPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('operators');
  const loadAll = useRegistrationStore((state) => state.loadAll);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    // Carregar dados reais da API
    const companyId = user?.companyId;
    if (companyId) {
      loadAll();
    }
  }, [loadAll, user?.companyId]);

  const tabs = [
    {
      id: 'operators' as TabType,
      label: 'Operadores',
      icon: Users,
      component: OperatorsList,
    },
    {
      id: 'machines' as TabType,
      label: 'Máquinas',
      icon: Factory,
      component: MachinesList,
    },
    {
      id: 'groups' as TabType,
      label: 'Células',
      icon: Grid3x3,
      component: GroupsList,
    },
    {
      id: 'shifts' as TabType,
      label: 'Turnos',
      icon: Clock,
      component: ShiftsList,
    },
    {
      id: 'stopReasons' as TabType,
      label: 'Motivos de Parada',
      icon: AlertTriangle,
      component: StopReasonsList,
    },
  ];

  const ActiveComponent = tabs.find((tab) => tab.id === activeTab)?.component;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Cadastros</h1>
          <p className="text-gray-600 mt-1">
            Gerencie operadores, máquinas, células, turnos e motivos de parada
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                      transition-colors duration-200
                      ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {ActiveComponent && <ActiveComponent />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegistrationPage;
