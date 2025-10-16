import { X, AlertTriangle } from 'lucide-react';

interface EmergencyModalProps {
  onClose: () => void;
  onConfirm: (reasonId: string) => void;
}

// Mock data
const emergencyReasons = [
  { id: 'e1', name: 'Risco de Acidente', severity: 'critical' },
  { id: 'e2', name: 'Falha Crítica de Equipamento', severity: 'critical' },
  { id: 'e3', name: 'Problema de Segurança', severity: 'critical' },
  { id: 'e4', name: 'Vazamento de Óleo/Fluido', severity: 'high' },
  { id: 'e5', name: 'Superaquecimento', severity: 'high' },
  { id: 'e6', name: 'Ruído Anormal', severity: 'medium' },
  { id: 'e7', name: 'Outros', severity: 'medium' },
];

const EmergencyModal = ({ onClose, onConfirm }: EmergencyModalProps) => {
  const handleReasonClick = (reasonId: string) => {
    // Salva automaticamente ao clicar no motivo
    onConfirm(reasonId);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-600 bg-red-50';
      case 'high':
        return 'border-orange-500 bg-orange-50';
      case 'medium':
        return 'border-yellow-500 bg-yellow-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b bg-red-600">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-10 h-10 text-white animate-pulse" />
            <div>
              <h2 className="text-3xl font-bold text-white">PARADA DE EMERGÊNCIA</h2>
              <p className="text-red-100 mt-1">Todas as máquinas serão paradas imediatamente</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-red-700 rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800 font-semibold">
              ⚠️ ATENÇÃO: Esta ação irá parar todas as suas máquinas imediatamente.
            </p>
            <p className="text-yellow-700 text-sm mt-1">
              Use apenas em situações de risco ou emergência real.
            </p>
          </div>

          <p className="text-gray-900 font-semibold mb-4 text-lg">
            Clique no motivo da emergência (salvamento automático):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {emergencyReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => handleReasonClick(reason.id)}
                className={`p-5 rounded-lg border-2 text-left transition-all hover:ring-2 hover:ring-red-300 active:scale-95 ${
                  getSeverityColor(reason.severity)
                }`}
              >
                <div className="flex items-start gap-3">
                  <AlertTriangle className={`w-6 h-6 flex-shrink-0 ${
                    reason.severity === 'critical' ? 'text-red-600' :
                    reason.severity === 'high' ? 'text-orange-600' :
                    'text-yellow-600'
                  }`} />
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">{reason.name}</p>
                    <p className="text-sm text-gray-600 mt-1 capitalize">
                      Severidade: {reason.severity === 'critical' ? 'Crítica' :
                                   reason.severity === 'high' ? 'Alta' : 'Média'}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
