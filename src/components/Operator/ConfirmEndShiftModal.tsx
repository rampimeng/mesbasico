import { X, AlertCircle } from 'lucide-react';

interface ConfirmEndShiftModalProps {
  onClose: () => void;
  onConfirmEndShift: () => void;
  onLogoutWithoutEndShift: () => void;
}

const ConfirmEndShiftModal = ({ onClose, onConfirmEndShift, onLogoutWithoutEndShift }: ConfirmEndShiftModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-8 h-8 text-orange-500" />
            <h2 className="text-2xl font-bold text-gray-900">Encerrar Turno?</h2>
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
          <p className="text-gray-700 text-lg mb-6">
            Você está com o turno em andamento. Deseja encerrar o turno antes de sair?
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <p className="text-yellow-800 text-sm">
              <strong>Se você escolher "Não":</strong> O contador de tempo de turno continuará rodando
              e você poderá retomar de onde parou ao fazer login novamente.
            </p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Se você escolher "Sim":</strong> Todas as máquinas serão paradas e o turno será
              finalizado. Você precisará iniciar um novo turno ao fazer login novamente.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirmEndShift}
              className="btn-danger btn-lg flex items-center justify-center gap-2"
            >
              Sim, Encerrar Turno e Sair
            </button>
            <button
              onClick={onLogoutWithoutEndShift}
              className="btn-secondary btn-lg flex items-center justify-center gap-2"
            >
              Não, Sair sem Encerrar Turno
            </button>
            <button
              onClick={onClose}
              className="btn-outline btn-lg flex items-center justify-center gap-2"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmEndShiftModal;
