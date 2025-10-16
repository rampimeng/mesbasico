import { X, AlertCircle } from 'lucide-react';

interface StopReasonModalProps {
  onClose: () => void;
  onConfirm: (reasonId: string) => void;
}

// Mock data
const mockStopReasons = [
  { id: 'r1', name: 'Troca de Matriz', category: 'Setup' },
  { id: 'r2', name: 'Manutenção Preventiva', category: 'Manutenção' },
  { id: 'r3', name: 'Falta de Material', category: 'Logística' },
  { id: 'r4', name: 'Quebra de Ferramenta', category: 'Manutenção' },
  { id: 'r5', name: 'Ajuste de Qualidade', category: 'Qualidade' },
  { id: 'r6', name: 'Pausa Programada', category: 'Operacional' },
  { id: 'r7', name: 'Falha Elétrica', category: 'Manutenção' },
  { id: 'r8', name: 'Outros', category: 'Diversos' },
];

const StopReasonModal = ({ onClose, onConfirm }: StopReasonModalProps) => {
  const handleReasonClick = (reasonId: string) => {
    // Salva automaticamente ao clicar no motivo
    onConfirm(reasonId);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Motivo da Parada</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 mb-6">
            Clique no motivo da parada (salvamento automático):
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {mockStopReasons.map((reason) => (
              <button
                key={reason.id}
                onClick={() => handleReasonClick(reason.id)}
                className="p-4 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-primary-500 hover:bg-primary-50 active:scale-95"
              >
                <p className="font-semibold text-gray-900">{reason.name}</p>
                <p className="text-sm text-gray-600 mt-1">{reason.category}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopReasonModal;
