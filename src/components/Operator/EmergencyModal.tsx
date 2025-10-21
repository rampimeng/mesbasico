import { X, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';

interface EmergencyModalProps {
  onClose: () => void;
  onConfirm: (reasonId: string) => void;
}

const EmergencyModal = ({ onClose, onConfirm }: EmergencyModalProps) => {
  const company = useAuthStore((state) => state.company);
  const allStopReasons = useRegistrationStore((state) => state.getStopReasons(company?.id || ''));

  // Filtrar motivos do sistema (como "Turno Encerrado") que não devem aparecer para o operador
  const stopReasons = allStopReasons.filter(reason => reason.name !== 'Turno Encerrado');

  const handleReasonClick = (reasonId: string) => {
    // Salva automaticamente ao clicar no motivo
    onConfirm(reasonId);
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
            {stopReasons.length === 0 ? (
              <p className="text-gray-500 text-center col-span-2 py-8">
                Nenhum motivo de parada cadastrado. Entre em contato com o administrador.
              </p>
            ) : (
              stopReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReasonClick(reason.id)}
                  className="p-5 rounded-lg border-2 text-left transition-all hover:ring-2 hover:ring-red-300 active:scale-95 border-red-600 bg-red-50"
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-6 h-6 flex-shrink-0 text-red-600" />
                    <div>
                      <p className="font-semibold text-gray-900 text-lg">{reason.name}</p>
                      {reason.category && (
                        <p className="text-sm text-gray-600 mt-1">{reason.category}</p>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmergencyModal;
