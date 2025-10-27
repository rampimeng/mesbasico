import { useState, useEffect } from 'react';
import { Machine, MachineStatus, MatrixStatus } from '@/types';
import { useMachineStore } from '@/store/machineStore';
import { useAuthStore } from '@/store/authStore';
import { Play, Square, Clock, Timer } from 'lucide-react';
import StopReasonModal from './StopReasonModal';
import { productionService } from '@/services/productionService';

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
  const [totalActiveSeconds, setTotalActiveSeconds] = useState(0);
  const [currentRunStart, setCurrentRunStart] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load machine active time from backend
  const loadMachineActiveTime = async () => {
    try {
      const data = await productionService.getMachineActiveTime(machine.id);
      setTotalActiveSeconds(data.totalActiveSeconds || 0);
      setCurrentRunStart(data.currentRunStart ? new Date(data.currentRunStart) : null);
    } catch (error) {
      console.error('❌ Error loading machine active time:', error);
    }
  };

  // Load active time on mount and every 5 seconds
  useEffect(() => {
    loadMachineActiveTime();

    const interval = setInterval(() => {
      loadMachineActiveTime();
    }, 5000);

    return () => clearInterval(interval);
  }, [machine.id]);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate active time (accumulated + current run)
  useEffect(() => {
    let totalSeconds = totalActiveSeconds;

    if (currentRunStart) {
      const now = currentTime.getTime();
      const start = currentRunStart.getTime();
      const currentRunSeconds = Math.floor((now - start) / 1000);
      totalSeconds += currentRunSeconds;
    }

    setActiveTime(totalSeconds);
  }, [totalActiveSeconds, currentRunStart, currentTime]);

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

  const handleStartMachine = async () => {
    updateMachineStatus(machine.id, MachineStatus.NORMAL_RUNNING, user?.id);
    // Iniciar todas as matrizes
    matrices.forEach((matrix) => {
      updateMatrixStatus(matrix.id, MatrixStatus.RUNNING);
    });
    // Reload active time immediately
    await loadMachineActiveTime();
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
      <div className={`border-3 ${getStatusColor()} transition-all duration-300 rounded-lg p-2 lg:p-4`}>
        {/* Machine Header */}
        <div className="mb-2">
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-base lg:text-xl xl:text-2xl font-bold text-gray-900 leading-tight">{machine.name}</h3>
            <div
              className={`inline-flex items-center px-1.5 py-0.5 lg:px-3 lg:py-1 rounded-full text-white font-semibold text-[9px] lg:text-xs whitespace-nowrap flex-shrink-0 ${
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
                ? 'Para'
                : machine.status === MachineStatus.EMERGENCY
                ? 'Emg'
                : 'Oci'}
            </div>
          </div>
          <p className="text-gray-600 text-[10px] lg:text-sm">{machine.code}</p>
        </div>

        {/* Time Display */}
        <div className="grid grid-cols-2 gap-1.5 lg:gap-3 mb-2">
          <div className="bg-blue-50 p-1.5 lg:p-3 rounded text-center">
            <Clock className="w-3 h-3 lg:w-5 lg:h-5 text-blue-600 mx-auto mb-0.5" />
            <p className="text-[8px] lg:text-xs text-blue-600">Ativo</p>
            <p className="text-xs lg:text-xl font-bold text-blue-700">{formatTime(activeTime)}</p>
          </div>
          <div className="bg-purple-50 p-1.5 lg:p-3 rounded text-center">
            <Timer className="w-3 h-3 lg:w-5 lg:h-5 text-purple-600 mx-auto mb-0.5" />
            <p className="text-[8px] lg:text-xs text-purple-600">Total</p>
            <p className="text-xs lg:text-xl font-bold text-purple-700">{formatTime(totalExpectedTime)}</p>
          </div>
        </div>

        {/* Machine Control Button */}
        <div className="mb-2">
          {machine.status === MachineStatus.IDLE || machine.status === MachineStatus.STOPPED ? (
            <button
              onClick={handleStartMachine}
              className="btn-success w-full py-1.5 lg:py-3 flex items-center justify-center gap-1.5 text-xs lg:text-base font-semibold"
            >
              <Play className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
              <span>{machine.status === MachineStatus.STOPPED ? 'Reiniciar' : 'Iniciar'}</span>
            </button>
          ) : (
            <button
              onClick={handleStopMachine}
              className="btn-danger w-full py-1.5 lg:py-3 flex items-center justify-center gap-1.5 text-xs lg:text-base font-semibold"
            >
              <Square className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
              <span>Parar</span>
            </button>
          )}
        </div>

        {/* Matrix Buttons - Side by Side */}
        {hasMatrices && (
          <div>
            <p className="text-[10px] lg:text-sm font-semibold text-gray-700 mb-1">Matrizes:</p>
            <div className="grid grid-cols-4 gap-1 lg:gap-2">
              {matrices.map((matrix, index) => (
                <button
                  key={matrix.id}
                  onClick={() => handleToggleMatrix(index)}
                  disabled={machine.status === MachineStatus.IDLE}
                  className={`
                    aspect-square rounded font-bold text-sm lg:text-xl transition-all
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
