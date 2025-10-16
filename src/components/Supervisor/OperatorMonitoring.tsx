import { useState } from 'react';
import { useMachineStore } from '@/store/machineStore';
import { Monitor, User, Eye } from 'lucide-react';
import OperatorMirrorView from './OperatorMirrorView';

const OperatorMonitoring = () => {
  const { machines } = useMachineStore();
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  // Mock operators with cell information
  const activeOperators = [
    { id: '4', name: 'Operador João', cell: 'Célula Injetoras', status: 'active' },
    { id: '5', name: 'Operador Maria', cell: 'Célula Sopradores', status: 'active' },
    { id: '6', name: 'Operador Pedro', cell: 'Célula Montagem', status: 'idle' },
  ];

  const getOperatorMachines = (operatorId: string) => {
    return machines.filter((m) => m.currentOperatorId === operatorId);
  };

  if (selectedOperator) {
    const operator = activeOperators.find((op) => op.id === selectedOperator);
    return (
      <OperatorMirrorView
        operatorId={selectedOperator}
        operatorName={operator?.name || ''}
        operatorCell={operator?.cell || ''}
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
          <Monitor className="w-8 h-8 text-primary-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Monitoramento de Operadores</h2>
            <p className="text-gray-600 mt-1">
              Visualize e controle em tempo real o que cada operador está fazendo
            </p>
          </div>
        </div>
      </div>

      {/* Operators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeOperators.map((operator) => {
          const operatorMachines = getOperatorMachines(operator.id);
          const runningMachines = operatorMachines.filter(
            (m) => m.status === 'NORMAL_RUNNING'
          ).length;

          return (
            <div
              key={operator.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {operator.name}
                    </h3>
                    <p className="text-sm text-gray-600">{operator.cell}</p>
                  </div>
                </div>

                <div
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    operator.status === 'active'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {operator.status === 'active' ? 'Ativo' : 'Ocioso'}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">Máquinas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {operatorMachines.length}
                  </p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-600">Em Giro</p>
                  <p className="text-2xl font-bold text-green-700">
                    {runningMachines}
                  </p>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => setSelectedOperator(operator.id)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                <Eye className="w-5 h-5" />
                Espelhar e Controlar
              </button>
            </div>
          );
        })}
      </div>

      {activeOperators.length === 0 && (
        <div className="text-center py-12">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Nenhum operador ativo no momento</p>
        </div>
      )}
    </div>
  );
};

export default OperatorMonitoring;
