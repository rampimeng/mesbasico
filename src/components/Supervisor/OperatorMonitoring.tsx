import { useState, useEffect, useMemo } from 'react';
import { Monitor, User, Eye, UserCheck, UserX } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useMachineStore } from '@/store/machineStore';
import OperatorMirrorView from './OperatorMirrorView';

const OperatorMonitoring = () => {
  const { company } = useAuthStore();
  const { operators, groups, loadOperators, loadGroups } = useRegistrationStore();
  const { machines, loadAllMachines } = useMachineStore();
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  useEffect(() => {
    loadOperators();
    loadGroups();
    loadAllMachines();

    // Set up polling to refresh machines every 2 seconds for real-time status
    const interval = setInterval(() => {
      loadAllMachines();
    }, 2000);

    return () => clearInterval(interval);
  }, [loadOperators, loadGroups, loadAllMachines]);

  // Get company operators
  const companyOperators = useMemo(() => {
    return operators.filter((op) => op.companyId === company?.id);
  }, [operators, company]);

  // Group operators by cell
  const operatorsByCell = useMemo(() => {
    const grouped: Record<string, any[]> = {
      'no-cell': [],
    };

    companyOperators.forEach((operator) => {
      // Find which groups this operator belongs to
      const operatorGroups = groups.filter((g) =>
        g.operatorIds && g.operatorIds.includes(operator.id)
      );

      if (operatorGroups.length === 0) {
        grouped['no-cell'].push({
          ...operator,
          groupName: 'Sem Célula',
          groupId: null,
        });
      } else {
        operatorGroups.forEach((group) => {
          if (!grouped[group.id]) {
            grouped[group.id] = [];
          }
          grouped[group.id].push({
            ...operator,
            groupName: group.name,
            groupId: group.id,
          });
        });
      }
    });

    return grouped;
  }, [companyOperators, groups]);

  // Check if operator is active (has machines running)
  const isOperatorActive = (operatorId: string) => {
    return machines.some(
      (m) => m.currentOperatorId === operatorId && m.status !== 'IDLE'
    );
  };

  if (selectedOperator) {
    const operator = companyOperators.find((op) => op.id === selectedOperator);
    const operatorWithGroup = Object.values(operatorsByCell)
      .flat()
      .find((op) => op.id === selectedOperator);

    return (
      <OperatorMirrorView
        operatorId={selectedOperator}
        operatorName={operator?.name || ''}
        operatorCell={operatorWithGroup?.groupName || 'Sem Célula'}
        onClose={() => setSelectedOperator(null)}
        interactive={true}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Operadores</h2>
            <p className="text-gray-600 mt-1">
              Clique em um operador para visualizar e controlar sua tela
            </p>
          </div>
        </div>
      </div>

      {companyOperators.length === 0 ? (
        /* Empty State - No operators */
        <div className="card">
          <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
            <User className="w-20 h-20 text-gray-300 mb-4" />
            <p className="text-gray-500 text-lg font-semibold">Nenhum operador cadastrado</p>
            <p className="text-gray-400 mt-2 text-center max-w-md">
              Cadastre operadores em Cadastros para começar o monitoramento
            </p>
          </div>
        </div>
      ) : (
        /* Operators by Cell */
        <div className="space-y-6">
          {Object.entries(operatorsByCell).map(([cellId, cellOperators]) => {
            if (cellOperators.length === 0) return null;

            const cellName = cellId === 'no-cell'
              ? 'Operadores sem Célula'
              : cellOperators[0]?.groupName || 'Célula';

            return (
              <div key={cellId} className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <div className="w-1 h-6 bg-blue-500 rounded"></div>
                  {cellName}
                  <span className="text-sm font-normal text-gray-500">
                    ({cellOperators.length} {cellOperators.length === 1 ? 'operador' : 'operadores'})
                  </span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cellOperators.map((operator) => {
                    const isActive = isOperatorActive(operator.id);

                    return (
                      <button
                        key={operator.id}
                        onClick={() => setSelectedOperator(operator.id)}
                        className={`
                          relative p-4 rounded-lg border-2 transition-all text-left
                          hover:shadow-lg hover:scale-105
                          ${isActive
                            ? 'border-green-400 bg-green-50 hover:border-green-500'
                            : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                          }
                        `}
                      >
                        {/* Status Badge */}
                        <div className="absolute top-2 right-2">
                          {isActive ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                              <UserCheck className="w-3 h-3" />
                              Ativo
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 px-2 py-1 bg-gray-400 text-white rounded-full text-xs font-semibold">
                              <UserX className="w-3 h-3" />
                              Inativo
                            </div>
                          )}
                        </div>

                        {/* Operator Info */}
                        <div className="mb-3 pr-20">
                          <div className="flex items-center gap-2 mb-1">
                            <User className={`w-5 h-5 ${isActive ? 'text-green-600' : 'text-gray-400'}`} />
                            <h4 className="font-semibold text-gray-900">{operator.name}</h4>
                          </div>
                          <p className="text-sm text-gray-600">{operator.email}</p>
                        </div>

                        {/* View Button */}
                        <div className="flex items-center justify-center gap-2 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                          <Eye className="w-4 h-4" />
                          <span className="text-sm font-semibold">Visualizar Tela</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OperatorMonitoring;
