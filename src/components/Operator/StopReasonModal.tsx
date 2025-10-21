import { X, AlertCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useRegistrationStore } from '@/store/registrationStore';

interface StopReasonModalProps {
  onClose: () => void;
  onConfirm: (reasonId: string) => void;
}

const StopReasonModal = ({ onClose, onConfirm }: StopReasonModalProps) => {
  const company = useAuthStore((state) => state.company);
  const allStopReasons = useRegistrationStore((state) => state.getStopReasons(company?.id || ''));

  // Filtrar motivos do sistema (como "Turno Encerrado") que não devem aparecer para o operador
  const stopReasons = allStopReasons.filter(reason => reason.name !== 'Turno Encerrado');

  const handleReasonClick = (reasonId: string) => {
    console.log('✋ StopReasonModal: User clicked reason:', reasonId);
    console.log('📋 Available stop reasons:', stopReasons);
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
            {stopReasons.length === 0 ? (
              <p className="text-gray-500 text-center col-span-2 py-8">
                Nenhum motivo de parada cadastrado. Entre em contato com o administrador.
              </p>
            ) : (
              stopReasons.map((reason) => (
                <button
                  key={reason.id}
                  onClick={() => handleReasonClick(reason.id)}
                  className="p-4 rounded-lg border-2 text-left transition-all border-gray-200 hover:border-primary-500 hover:bg-primary-50 active:scale-95"
                >
                  <p className="font-semibold text-gray-900">{reason.name}</p>
                  {reason.category && (
                    <p className="text-sm text-gray-600 mt-1">{reason.category}</p>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StopReasonModal;
