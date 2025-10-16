import { useState } from 'react';
import { Matrix, MatrixStatus, MachineStatus } from '@/types';
import { useMachineStore } from '@/store/machineStore';
import { Play, Square, CheckCircle2 } from 'lucide-react';
import StopReasonModal from './StopReasonModal';

interface MatrixControlProps {
  matrix: Matrix;
  machineStatus: MachineStatus;
}

const MatrixControl = ({ matrix, machineStatus }: MatrixControlProps) => {
  const { updateMatrixStatus } = useMachineStore();
  const [showStopReasonModal, setShowStopReasonModal] = useState(false);
  const [cycleCount, setCycleCount] = useState(0);

  const handleToggleMatrix = () => {
    if (matrix.status === MatrixStatus.STOPPED) {
      updateMatrixStatus(matrix.id, MatrixStatus.RUNNING);
    } else {
      setShowStopReasonModal(true);
    }
  };

  const handleStopConfirm = (reasonId: string) => {
    updateMatrixStatus(matrix.id, MatrixStatus.STOPPED, reasonId);
    setShowStopReasonModal(false);
  };

  const handleRecordCycle = () => {
    setCycleCount((prev) => prev + 1);
    // Aqui você pode adicionar lógica para registrar o ciclo no backend
  };

  const isDisabled = machineStatus === MachineStatus.IDLE || machineStatus === MachineStatus.EMERGENCY;

  return (
    <div
      className={`p-4 rounded-lg border-2 ${
        matrix.status === MatrixStatus.RUNNING
          ? 'bg-green-50 border-green-300'
          : 'bg-red-50 border-red-300'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div>
          <h5 className="font-semibold text-lg">Matriz {matrix.matrixNumber}</h5>
          <p className={`text-sm ${matrix.status === MatrixStatus.RUNNING ? 'text-green-700' : 'text-red-700'}`}>
            {matrix.status === MatrixStatus.RUNNING ? 'Em Giro' : 'Parada'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Ciclos</p>
          <p className="text-2xl font-bold text-gray-900">{cycleCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleToggleMatrix}
          disabled={isDisabled}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-colors ${
            matrix.status === MatrixStatus.RUNNING
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {matrix.status === MatrixStatus.RUNNING ? (
            <>
              <Square className="w-5 h-5" />
              Parar
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              Giro
            </>
          )}
        </button>

        <button
          onClick={handleRecordCycle}
          disabled={isDisabled || matrix.status === MatrixStatus.STOPPED}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-5 h-5" />
          Giro
        </button>
      </div>

      {showStopReasonModal && (
        <StopReasonModal
          onClose={() => setShowStopReasonModal(false)}
          onConfirm={handleStopConfirm}
        />
      )}
    </div>
  );
};

export default MatrixControl;
