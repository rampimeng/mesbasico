import { useState, useEffect } from 'react';
import { Machine, MachineStatus, MatrixStatus } from '@/types';
import { useMachineStore } from '@/store/machineStore';
import { useAuthStore } from '@/store/authStore';
import { Play, Square, Clock, Timer } from 'lucide-react';
import StopReasonModal from './StopReasonModal';

interface MachineCardProps {
  machine: Machine;
}

const MachineCard = ({ machine }: MachineCardProps) => {
  const { user } = useAuthStore();
  const { getMatricesByMachine, updateMachineStatus, updateMatrixStatus } = useMachineStore();

  const matrices = getMatricesByMachine(machine.id);
  const [showStopModal, setShowStopModal] = useState(false);
  const [stopTarget, setStopTarget] = useState<'machine' | number>('machine');
  const [activeTime, setActiveTime] = useState(0);
  const [isRunning, setIsRunning] = useState(machine.status === MachineStatus.NORMAL_RUNNING);

  // Timer para contabilizar tempo de atividade
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;

    if (isRunning && machine.status === MachineStatus.NORMAL_RUNNING) {
      interval = setInterval(() => {
        setActiveTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, machine.status]);

  useEffect(() => {
    setIsRunning(machine.status === MachineStatus.NORMAL_RUNNING);
  }, [machine.status]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const getStatusColor = () => {
    switch (machine.status) {
      case MachineStatus.NORMAL_RUNNING:
        return 'border-green-400 bg-green-50';
      case MachineStatus.STOPPED:
      case MachineStatus.EMERGENCY:
        return 'border-red-400 bg-red-50';
      case MachineStatus.IDLE:
        return 'border-gray-300 bg-gray-50';
      default:
        return 'border-gray-300 bg-gray-50';
    }
  };

  const handleStartMachine = () => {
    updateMachineStatus(machine.id, MachineStatus.NORMAL_RUNNING, user?.id);
    // Iniciar todas as matrizes
    matrices.forEach((matrix) => {
      updateMatrixStatus(matrix.id, MatrixStatus.RUNNING);
    });
    setActiveTime(0);
    setIsRunning(true);
  };

  const handleStopMachine = () => {
    setStopTarget('machine');
    setShowStopModal(true);
  };

  const handleStopConfirm = (reasonId: string) => {
    console.log('🛑 handleStopConfirm called with reasonId:', reasonId);
    console.log('🎯 stopTarget:', stopTarget);

    if (stopTarget === 'machine') {
      // Parar a máquina e todas as matrizes
      console.log('🚫 Stopping entire machine with reasonId:', reasonId);
      updateMachineStatus(machine.id, MachineStatus.STOPPED, user?.id, reasonId);
      matrices.forEach((matrix) => {
        console.log('🚫 Stopping matrix', matrix.id, 'with reasonId:', reasonId);
        updateMatrixStatus(matrix.id, MatrixStatus.STOPPED, reasonId);
      });
      setIsRunning(false);
    } else {
      // Parar matriz específica
      const matrixId = matrices[stopTarget as number]?.id;
      console.log('🚫 Stopping matrix', matrixId, 'with reasonId:', reasonId);
      if (matrixId) {
        updateMatrixStatus(matrixId, MatrixStatus.STOPPED, reasonId);
      }
    }
    setShowStopModal(false);
  };

  const handleToggleMatrix = (matrixIndex: number) => {
    const matrix = matrices[matrixIndex];
    if (!matrix) return;

    if (matrix.status === MatrixStatus.STOPPED) {
      // Iniciar matriz
      updateMatrixStatus(matrix.id, MatrixStatus.RUNNING);
    } else {
      // Parar matriz - abrir modal de motivo
      setStopTarget(matrixIndex);
      setShowStopModal(true);
    }
  };

  // Se numberOfMatrices = 0, não mostrar botões de matriz
  const hasMatrices = machine.numberOfMatrices > 0;
  const totalExpectedTime = machine.standardCycleTime * 8; // 8 horas de turno

  return (
    <>
      <div className={`card border-4 ${getStatusColor()} transition-all duration-300 p-3 sm:p-4`}>
        {/* Machine Header */}
        <div className="mb-3">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 leading-tight">{machine.name}</h3>
            <div
              className={`inline-flex items-center px-2 py-0.5 sm:px-3 sm:py-1 rounded-full text-white font-semibold text-[10px] sm:text-xs whitespace-nowrap flex-shrink-0 ${
                machine.status === MachineStatus.NORMAL_RUNNING
                  ? 'bg-green-500'
                  : machine.status === MachineStatus.STOPPED
                  ? 'bg-red-500'
                  : machine.status === MachineStatus.EMERGENCY
                  ? 'bg-orange-500'
                  : 'bg-gray-400'
              }`}
            >
              {machine.status === MachineStatus.NORMAL_RUNNING
                ? 'Giro'
                : machine.status === MachineStatus.STOPPED
                ? 'Parada'
                : machine.status === MachineStatus.EMERGENCY
                ? 'Emerg.'
                : 'Ociosa'}
            </div>
          </div>
          <p className="text-gray-600 text-xs sm:text-sm">{machine.code}</p>
        </div>

        {/* Time Display */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-3">
          <div className="bg-blue-50 p-2 sm:p-3 rounded-lg text-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mx-auto mb-1" />
            <p className="text-[10px] sm:text-xs text-blue-600 mb-0.5">Tempo Ativo</p>
            <p className="text-sm sm:text-lg lg:text-xl font-bold text-blue-700">{formatTime(activeTime)}</p>
          </div>
          <div className="bg-purple-50 p-2 sm:p-3 rounded-lg text-center">
            <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 mx-auto mb-1" />
            <p className="text-[10px] sm:text-xs text-purple-600 mb-0.5">Tempo Total</p>
            <p className="text-sm sm:text-lg lg:text-xl font-bold text-purple-700">{formatTime(totalExpectedTime)}</p>
          </div>
        </div>

        {/* Machine Control Button */}
        <div className="mb-3">
          {machine.status === MachineStatus.IDLE || machine.status === MachineStatus.STOPPED ? (
            <button
              onClick={handleStartMachine}
              className="btn-success w-full py-2 sm:py-3 lg:py-4 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg font-semibold"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">{machine.status === MachineStatus.STOPPED ? 'Reiniciar' : 'Iniciar Máquina'}</span>
              <span className="sm:hidden">{machine.status === MachineStatus.STOPPED ? 'Reiniciar' : 'Iniciar'}</span>
            </button>
          ) : (
            <button
              onClick={handleStopMachine}
              className="btn-danger w-full py-2 sm:py-3 lg:py-4 flex items-center justify-center gap-2 text-sm sm:text-base lg:text-lg font-semibold"
            >
              <Square className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
              <span className="hidden sm:inline">Parar Máquina</span>
              <span className="sm:hidden">Parar</span>
            </button>
          )}
        </div>

        {/* Matrix Buttons - Side by Side */}
        {hasMatrices && (
          <div>
            <p className="text-xs sm:text-sm font-semibold text-gray-700 mb-2">Matrizes:</p>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
              {matrices.map((matrix, index) => (
                <button
                  key={matrix.id}
                  onClick={() => handleToggleMatrix(index)}
                  disabled={machine.status === MachineStatus.IDLE}
                  className={`
                    aspect-square rounded-lg font-bold text-base sm:text-lg lg:text-xl transition-all
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      matrix.status === MatrixStatus.RUNNING
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }
                  `}
                >
                  {matrix.matrixNumber}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Stop Reason Modal */}
      {showStopModal && (
        <StopReasonModal
          onClose={() => setShowStopModal(false)}
          onConfirm={handleStopConfirm}
        />
      )}
    </>
  );
};

export default MachineCard;
