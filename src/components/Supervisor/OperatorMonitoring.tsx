import { useState } from 'react';
import { Monitor, User, AlertCircle } from 'lucide-react';
import OperatorMirrorView from './OperatorMirrorView';

const OperatorMonitoring = () => {
  const [selectedOperator, setSelectedOperator] = useState<string | null>(null);

  // No mock data - will load from API when available
  const activeOperators: any[] = [];

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

      {/* Empty State */}
      <div className="card">
        <div className="flex flex-col items-center justify-center py-16 bg-gray-50 rounded-lg">
          <User className="w-20 h-20 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg font-semibold">Nenhum operador ativo</p>
          <p className="text-gray-400 mt-2 text-center max-w-md">
            Operadores aparecerão aqui quando iniciarem a produção
          </p>
        </div>
      </div>

      {/* Helpful Info Card */}
      <div className="card bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">Como funciona o monitoramento?</h3>
            <ul className="text-blue-800 space-y-2 text-sm">
              <li><strong>1.</strong> Cadastre operadores e vincule-os a grupos/células nas <strong>Configurações</strong></li>
              <li><strong>2.</strong> Operadores fazem login e iniciam a produção</li>
              <li><strong>3.</strong> Você poderá ver e controlar em tempo real todas as máquinas de cada operador</li>
              <li><strong>4.</strong> Use o botão "Espelhar e Controlar" para interagir com a tela do operador</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorMonitoring;
