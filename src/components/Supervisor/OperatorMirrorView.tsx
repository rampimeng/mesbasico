import { useEffect } from 'react';
import { X, Monitor, Edit } from 'lucide-react';
import { useMachineStore } from '@/store/machineStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useAuthStore } from '@/store/authStore';
import MachineCard from '@/components/Operator/MachineCard';
import { Machine } from '@/types';

interface OperatorMirrorViewProps {
  operatorId: string;
  operatorName: string;
  operatorCell: string;
  onClose: () => void;
  interactive?: boolean;
}

const OperatorMirrorView = ({
  operatorId,
  operatorName,
  operatorCell,
  onClose,
  interactive = false,
}: OperatorMirrorViewProps) => {
  const company = useAuthStore((state) => state.company);
  const { machines: allMachines, loadAllMachines } = useMachineStore();
  const users = useRegistrationStore((state) => state.getOperators(company?.id || ''));

  // Load all machines when component mounts
  useEffect(() => {
    loadAllMachines();

    // Set up polling to refresh data every 2 seconds for real-time updates
    const interval = setInterval(() => {
      loadAllMachines();
    }, 2000);

    return () => clearInterval(interval);
  }, [loadAllMachines]);

  // Get operator's groupIds
  const operator = users.find((u) => u.id === operatorId);
  const operatorGroupIds = operator?.groupIds || [];

  console.log('🔍 OperatorMirrorView Debug:', {
    operatorId,
    operatorName,
    operator,
    operatorGroupIds,
    allMachinesCount: allMachines.length,
    allMachines: allMachines.map(m => ({
      id: m.id,
      name: m.name,
      groupId: m.groupId,
      status: m.status,
      currentOperatorId: m.currentOperatorId
    }))
  });

  // Filter machines that belong to operator's groups OR are currently operated by this operator
  const operatorMachines: Machine[] = allMachines.filter((m) => {
    // Check if machine belongs to one of operator's groups
    const belongsToGroup = m.groupId && operatorGroupIds.includes(m.groupId);
    // Check if this operator is currently operating the machine
    const currentlyOperating = m.currentOperatorId === operatorId;

    console.log(`🔎 Machine ${m.name}:`, {
      groupId: m.groupId,
      currentOperatorId: m.currentOperatorId,
      belongsToGroup,
      currentlyOperating,
      willShow: belongsToGroup || currentlyOperating
    });

    return belongsToGroup || currentlyOperating;
  });

  console.log('✅ Filtered operator machines:', operatorMachines.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`card ${interactive ? 'bg-blue-50 border-2 border-blue-400' : 'bg-yellow-50 border-2 border-yellow-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className={`w-8 h-8 ${interactive ? 'text-blue-600' : 'text-yellow-600'}`} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {interactive ? 'Controle Remoto' : 'Espelhamento'} - {operatorName}
              </h2>
              <p className="text-gray-700 mt-1">
                Célula: <span className="font-semibold">{operatorCell}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Fechar
          </button>
        </div>

        <div className={`mt-4 flex items-center gap-2 text-sm ${interactive ? 'text-blue-800' : 'text-yellow-800'}`}>
          {interactive ? (
            <>
              <Edit className="w-4 h-4" />
              <span>Modo interativo - Você pode atuar nas máquinas do operador</span>
            </>
          ) : (
            <span>Modo somente leitura</span>
          )}
        </div>
      </div>

      {/* Operator's Machines */}
      <div className={interactive ? '' : 'relative'}>
        {!interactive && (
          <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed"></div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${interactive ? '' : 'opacity-90'}`}>
          {operatorMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      </div>

      {operatorMachines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Operador sem máquinas ativas</p>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="card bg-blue-50 border-2 border-blue-300">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-blue-900 font-semibold">
            Atualização em tempo real - Sub-segundo
          </p>
        </div>
      </div>
    </div>
  );
};

export default OperatorMirrorView;
