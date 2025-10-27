import { useEffect, useState } from 'react';
import { X, Monitor, Edit, Play, LogOut, AlertTriangle, Clock } from 'lucide-react';
import { useMachineStore } from '@/store/machineStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { useAuthStore } from '@/store/authStore';
import { useAuditStore } from '@/store/auditStore';
import MachineCard from '@/components/Operator/MachineCard';
import EmergencyModal from '@/components/Operator/EmergencyModal';
import { Machine, MachineStatus } from '@/types';
import { productionService } from '@/services/productionService';

interface OperatorMirrorViewProps {
  operatorId: string;
  operatorName: string;
  operatorCell: string;
  onClose: () => void;
  interactive?: boolean;
}

const OperatorMirrorView = ({
  operatorId,
  operatorName,
  operatorCell,
  onClose,
  interactive = false,
}: OperatorMirrorViewProps) => {
  const company = useAuthStore((state) => state.company);
  const { machines: allMachines, loadAllMachines, updateMachineStatus, startSession, isMachineInUse } = useMachineStore();
  const users = useRegistrationStore((state) => state.getOperators(company?.id || ''));
  const { getTodayCycles } = useAuditStore();
  const { loadStopReasons } = useRegistrationStore();

  // Modal states
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');

  // Shift timer states
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftDuration, setShiftDuration] = useState('00:00:00');

  // Cycles counter
  const [todayCycles, setTodayCycles] = useState(0);

  // Toast notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);

  // Show notification that auto-dismisses after 3 seconds
  const showNotification = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setNotification({ message, type });
  };

  // Auto-dismiss notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load all machines when component mounts
  useEffect(() => {
    loadAllMachines();
    loadStopReasons();
    loadShiftStartTime();

    // Set up polling to refresh data every 2 seconds for real-time updates
    const interval = setInterval(() => {
      loadAllMachines();
    }, 2000);

    return () => clearInterval(interval);
  }, [loadAllMachines, loadStopReasons]);

  // Load shift start time
  const loadShiftStartTime = async () => {
    try {
      const data = await productionService.getOperatorShiftStart(operatorId);
      if (data.shiftStartTime) {
        setShiftStartTime(new Date(data.shiftStartTime));
      } else {
        setShiftStartTime(null);
      }
    } catch (error) {
      console.error('❌ Error loading shift start time:', error);
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calculate shift duration
  useEffect(() => {
    if (shiftStartTime) {
      const now = currentTime.getTime();
      const start = shiftStartTime.getTime();
      const diff = Math.max(0, now - start);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setShiftDuration(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    }
  }, [shiftStartTime, currentTime]);

  // Update cycles counter whenever machines change
  useEffect(() => {
    setTodayCycles(getTodayCycles(company?.id || '', operatorId));
  }, [allMachines, operatorId, company, getTodayCycles]);

  // Format current time for São Paulo timezone
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  // Get operator's groupIds
  const operator = users.find((u) => u.id === operatorId);
  const operatorGroupIds = operator?.groupIds || [];

  // Handler functions
  const handleStartShift = async () => {
    if (!interactive) return; // Only allow in interactive mode

    try {
      console.log('🎬 Starting shift for operator:', operatorName);

      if (operatorMachines.length === 0) {
        showNotification('Erro: Nenhuma máquina disponível.', 'error');
        return;
      }

      // Verificar se alguma máquina já está em uso
      const machineInUse = operatorMachines.find((m) => {
        const inUse = isMachineInUse(m.id);
        return inUse && m.currentOperatorId !== operatorId;
      });

      if (machineInUse) {
        setBlockedMessage(
          'O grupo de máquina que você está alocado já está em produção, procure o supervisor.'
        );
        return;
      }

      let successCount = 0;
      let errorCount = 0;

      for (const machine of operatorMachines) {
        const canStart = machine.status === MachineStatus.IDLE || machine.status === MachineStatus.STOPPED;

        if (canStart) {
          try {
            await startSession(machine.id, operatorId);
            successCount++;
          } catch (error: any) {
            errorCount++;
            showNotification(`Erro ao iniciar máquina ${machine.name}: ${error.message}`, 'error');
          }
        }
      }

      if (successCount > 0) {
        showNotification(`Turno iniciado! ${successCount} máquina(s) em produção.`, 'success');
      }

      if (errorCount > 0) {
        showNotification(`${errorCount} máquina(s) falharam ao iniciar.`, 'error');
      }

      await loadShiftStartTime();
    } catch (error: any) {
      showNotification(`Erro ao iniciar turno: ${error.message}`, 'error');
    }
  };

  const handleEndShift = async () => {
    if (!interactive) return;

    try {
      console.log('🏁 Ending shift for operator:', operatorName);

      const shiftEndReasonId = await productionService.getShiftEndReasonId();

      let successCount = 0;
      let errorCount = 0;

      for (const machine of operatorMachines) {
        if (machine.status !== MachineStatus.IDLE) {
          try {
            // First stop the machine with "Turno Encerrado" reason
            if (machine.status !== MachineStatus.STOPPED) {
              await updateMachineStatus(machine.id, MachineStatus.STOPPED, operatorId, shiftEndReasonId);
            }
            // Then end the production session
            await productionService.endSession(machine.id, operatorId);
            successCount++;
          } catch (error: any) {
            errorCount++;
            showNotification(`Erro ao encerrar sessão da máquina ${machine.name}: ${error.message}`, 'error');
          }
        }
      }

      if (successCount > 0) {
        showNotification(`Turno encerrado! ${successCount} sessão(ões) encerrada(s).`, 'success');
      }

      if (errorCount > 0) {
        showNotification(`${errorCount} sessão(ões) falharam ao encerrar.`, 'error');
      }

      setShiftStartTime(null);
      setShiftDuration('00:00:00');
    } catch (error: any) {
      showNotification(`Erro ao encerrar turno: ${error.message}`, 'error');
    }
  };

  const handlePauseAll = () => {
    if (!interactive) return;
    setShowEmergencyModal(true);
  };

  const handlePauseAllConfirm = async (reasonId: string) => {
    if (!interactive) return;

    for (const machine of operatorMachines) {
      if (machine.status !== MachineStatus.IDLE && machine.status !== MachineStatus.STOPPED) {
        await updateMachineStatus(machine.id, MachineStatus.STOPPED, operatorId, reasonId);
      }
    }

    showNotification('Pausa geral registrada! Todas as máquinas foram paradas.', 'warning');
    setShowEmergencyModal(false);
  };

  const handleAddCycle = async () => {
    if (!interactive) return;

    const activeMachine = operatorMachines.find(m => m.status === MachineStatus.NORMAL_RUNNING);

    if (activeMachine && company) {
      try {
        await productionService.recordCycle(activeMachine.id, undefined, operatorId);
        setTodayCycles(prev => prev + 1);
        showNotification('Giro registrado com sucesso!', 'success');
      } catch (error) {
        showNotification('Erro ao registrar giro.', 'error');
      }
    }
  };

  console.log('🔍 OperatorMirrorView Debug:', {
    operatorId,
    operatorName,
    operator,
    operatorGroupIds,
    allMachinesCount: allMachines.length,
    allMachines: allMachines.map(m => ({
      id: m.id,
      name: m.name,
      groupId: m.groupId,
      status: m.status,
      currentOperatorId: m.currentOperatorId
    }))
  });

  // Filter machines that belong to operator's groups OR are currently operated by this operator
  const operatorMachines: Machine[] = allMachines.filter((m) => {
    // Check if machine belongs to one of operator's groups
    const belongsToGroup = m.groupId && operatorGroupIds.includes(m.groupId);
    // Check if this operator is currently operating the machine
    const currentlyOperating = m.currentOperatorId === operatorId;

    console.log(`🔎 Machine ${m.name}:`, {
      groupId: m.groupId,
      currentOperatorId: m.currentOperatorId,
      belongsToGroup,
      currentlyOperating,
      willShow: belongsToGroup || currentlyOperating
    });

    return belongsToGroup || currentlyOperating;
  });

  console.log('✅ Filtered operator machines:', operatorMachines.length);

  // Check if any machine is active
  const anyMachineActive = operatorMachines.some(
    (m) => m.status !== MachineStatus.IDLE && m.status !== MachineStatus.STOPPED
  );

  // Shift is active if there are active machines or shift start time exists
  const shiftIsActive = anyMachineActive || shiftStartTime !== null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className={`card ${interactive ? 'bg-blue-50 border-2 border-blue-400' : 'bg-yellow-50 border-2 border-yellow-400'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className={`w-8 h-8 ${interactive ? 'text-blue-600' : 'text-yellow-600'}`} />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {interactive ? 'Controle Remoto' : 'Espelhamento'} - {operatorName}
              </h2>
              <p className="text-gray-700 mt-1">
                Célula: <span className="font-semibold">{operatorCell}</span>
              </p>
            </div>
          </div>

          {/* Timer and Clock Section */}
          <div className="flex items-center gap-4">
            {/* Shift Timer */}
            {shiftStartTime && (
              <div className="bg-blue-50 px-4 py-2 rounded-lg border-2 border-blue-300">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-xs text-blue-600 font-semibold">Tempo de Turno</p>
                    <p className="text-xl font-bold text-blue-700 tabular-nums">{shiftDuration}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Current Time */}
            <div className="bg-green-50 px-4 py-2 rounded-lg border-2 border-green-300">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-xs text-green-600 font-semibold">Hora Atual</p>
                  <p className="text-xl font-bold text-green-700 tabular-nums">{formatCurrentTime()}</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-secondary flex items-center gap-2"
          >
            <X className="w-5 h-5" />
            Fechar
          </button>
        </div>

        <div className={`mt-4 flex items-center gap-2 text-sm ${interactive ? 'text-blue-800' : 'text-yellow-800'}`}>
          {interactive ? (
            <>
              <Edit className="w-4 h-4" />
              <span>Modo interativo - Você pode atuar nas máquinas do operador</span>
            </>
          ) : (
            <span>Modo somente leitura</span>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className={interactive ? '' : 'relative'}>
        {!interactive && (
          <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed"></div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {!shiftIsActive ? (
            <button
              onClick={handleStartShift}
              disabled={!interactive}
              className="btn-success btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-8 h-8" />
              <span>Iniciar Turno</span>
            </button>
          ) : (
            <button
              onClick={handleEndShift}
              disabled={!interactive}
              className="btn-danger btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut className="w-8 h-8" />
              <span>Encerrar Turno</span>
            </button>
          )}

          <button
            onClick={handlePauseAll}
            disabled={!anyMachineActive || !interactive}
            className="btn-warning btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <AlertTriangle className="w-8 h-8" />
            <span>PAUSA GERAL</span>
          </button>

          <button
            onClick={handleAddCycle}
            disabled={!anyMachineActive || !interactive}
            className="btn-primary btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl font-bold">{todayCycles}</div>
              <div className="text-sm">Adicionar Giro</div>
            </div>
          </button>
        </div>
      </div>

      {/* Blocked Message */}
      {blockedMessage && (
        <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-lg">Acesso Bloqueado</p>
            <p className="mt-1">{blockedMessage}</p>
            <button
              onClick={() => setBlockedMessage('')}
              className="mt-3 btn-secondary"
            >
              Entendi
            </button>
          </div>
        </div>
      )}

      {/* Operator's Machines */}
      <div className={interactive ? '' : 'relative'}>
        {!interactive && (
          <div className="absolute inset-0 z-10 bg-transparent cursor-not-allowed"></div>
        )}

        <div className={`grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 ${interactive ? '' : 'opacity-90'}`}>
          {operatorMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>
      </div>

      {operatorMachines.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">Operador sem máquinas ativas</p>
        </div>
      )}

      {/* Real-time indicator */}
      <div className="card bg-blue-50 border-2 border-blue-300">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
          <p className="text-blue-900 font-semibold">
            Atualização em tempo real - Sub-segundo
          </p>
        </div>
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={handlePauseAllConfirm}
        />
      )}

      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div
            className={`px-6 py-4 rounded-lg shadow-2xl border-2 flex items-center gap-3 min-w-[300px] max-w-md ${
              notification.type === 'success'
                ? 'bg-green-50 border-green-400 text-green-800'
                : notification.type === 'error'
                ? 'bg-red-50 border-red-400 text-red-800'
                : 'bg-yellow-50 border-yellow-400 text-yellow-800'
            }`}
          >
            <div className="flex-1">
              <p className="font-semibold text-lg">{notification.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorMirrorView;
