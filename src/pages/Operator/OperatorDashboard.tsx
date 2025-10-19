import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMachineStore } from '@/store/machineStore';
import { useAuditStore } from '@/store/auditStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { MachineStatus } from '@/types';
import MachineCard from '@/components/Operator/MachineCard';
import EmergencyModal from '@/components/Operator/EmergencyModal';
import { AlertTriangle, LogOut, Play, RefreshCw, Clock } from 'lucide-react';
import { productionService } from '@/services/productionService';

const OperatorDashboard = () => {
  const { user, company, logout } = useAuthStore();
  const { machines, loadMyMachines, updateMachineStatus, startSession, isMachineInUse } = useMachineStore();
  const { getTodayCycles } = useAuditStore();
  const { loadStopReasons } = useRegistrationStore();

  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [todayCycles, setTodayCycles] = useState(getTodayCycles(company?.id || '', user?.id));

  // Shift timer states
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [shiftDuration, setShiftDuration] = useState('00:00:00');

  // Load machines and stop reasons on mount
  useEffect(() => {
    console.log('🔄 OperatorDashboard mounted, loading data...');
    loadMyMachines();
    loadStopReasons();
    loadShiftStartTime();
  }, [loadMyMachines, loadStopReasons]);

  useEffect(() => {
    setTodayCycles(getTodayCycles(company?.id || '', user?.id));
  }, [machines, user, company, getTodayCycles]);

  // Load shift start time
  const loadShiftStartTime = async () => {
    try {
      const data = await productionService.getTodayShiftStart();
      if (data.shiftStartTime) {
        setShiftStartTime(new Date(data.shiftStartTime));
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

  // Format current time for São Paulo timezone
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleStartShift = async () => {
    try {
      if (!user) {
        console.warn('⚠️ No user found');
        alert('Erro: Usuário não encontrado. Faça login novamente.');
        return;
      }

      console.log('🎬 Starting shift for operator:', user.name);
      console.log('📋 Machines available:', machines);
      console.log('📋 Machine statuses:', machines.map(m => ({ id: m.id, name: m.name, status: m.status })));

      if (machines.length === 0) {
        console.warn('⚠️ No machines available');
        alert('Erro: Nenhuma máquina disponível. Entre em contato com o administrador.');
        return;
      }

      // Verificar se alguma máquina já está em uso por outro operador
      const machineInUse = machines.find((m) => {
        const inUse = isMachineInUse(m.id);
        return inUse && m.currentOperatorId !== user?.id;
      });

      if (machineInUse) {
        console.warn('⚠️ Machine in use:', machineInUse);
        setBlockedMessage(
          'O grupo de máquina que você está alocado já está em produção, procure o supervisor.'
        );
        return;
      }

      // Iniciar todas as máquinas (IDLE ou STOPPED)
      console.log('🚀 Starting all machines...');
      let successCount = 0;
      let errorCount = 0;

      for (const machine of machines) {
        console.log(`🔍 Checking machine ${machine.name}, status: ${machine.status}`);

        // Pode iniciar máquinas IDLE ou STOPPED
        const canStart = machine.status === MachineStatus.IDLE || machine.status === MachineStatus.STOPPED;

        if (canStart) {
          console.log(`✅ Starting machine ${machine.name}`);
          try {
            await startSession(machine.id, user.id);
            successCount++;
            console.log(`✅ Machine ${machine.name} started successfully`);
          } catch (error: any) {
            errorCount++;
            console.error(`❌ Error starting machine ${machine.name}:`, error);
            alert(`Erro ao iniciar máquina ${machine.name}: ${error.message}`);
          }
        } else {
          console.log(`⏭️ Skipping machine ${machine.name}, already running (status: ${machine.status})`);
        }
      }

      console.log(`✅ Shift started! Success: ${successCount}, Errors: ${errorCount}`);

      if (successCount > 0) {
        alert(`${successCount} máquina(s) iniciada(s) com sucesso!`);
      }

      if (errorCount > 0) {
        alert(`${errorCount} máquina(s) falharam ao iniciar. Verifique o console.`);
      }

      // Reload shift start time
      await loadShiftStartTime();
    } catch (error: any) {
      console.error('❌ Error in handleStartShift:', error);
      alert(`Erro ao iniciar turno: ${error.message}`);
    }
  };

  const handleEmergencyStop = () => {
    setShowEmergencyModal(true);
  };

  const handleEmergencyConfirm = async (reasonId: string) => {
    if (!user) return;

    // Parar todas as máquinas em emergência
    for (const machine of machines) {
      if (machine.status !== MachineStatus.IDLE) {
        await updateMachineStatus(machine.id, MachineStatus.EMERGENCY, user.id, reasonId);
      }
    }
    setShowEmergencyModal(false);
  };

  const handleAddCycle = async () => {
    // Registrar giro no backend
    const activeMachine = machines.find(m => m.status === MachineStatus.NORMAL_RUNNING);

    if (activeMachine && user && company) {
      try {
        await productionService.recordCycle(activeMachine.id);

        // Atualizar contador local
        setTodayCycles(prev => prev + 1);

        console.log('✅ Cycle recorded successfully');
      } catch (error) {
        console.error('❌ Error recording cycle:', error);
      }
    }
  };

  // Todas as máquinas já estão rodando? Desabilita "Iniciar Turno"
  const allMachinesRunning = machines.every(
    (m) => m.status === MachineStatus.NORMAL_RUNNING
  );

  // Alguma máquina está ativa (não IDLE e não STOPPED)? Habilita Emergência e Adicionar Giro
  const anyMachineActive = machines.some(
    (m) => m.status !== MachineStatus.IDLE && m.status !== MachineStatus.STOPPED
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-full mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {company?.logoUrl && (
                <img
                  src={company.logoUrl}
                  alt="Logo da Empresa"
                  className="h-12 object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Painel do Operador
                </h1>
                <p className="text-gray-600 mt-1">
                  Olá, <span className="font-semibold">{user?.name}</span>
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

            <div className="flex items-center gap-3">
              <button
                onClick={() => window.location.reload()}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                <span className="hidden sm:inline">Atualizar</span>
              </button>
              <button
                onClick={logout}
                className="btn-secondary flex items-center gap-2"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Sair</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Actions */}
      <div className="max-w-full mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <button
            onClick={handleStartShift}
            disabled={allMachinesRunning}
            className="btn-success btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Play className="w-8 h-8" />
            <span>Iniciar Turno</span>
          </button>

          <button
            onClick={handleEmergencyStop}
            disabled={!anyMachineActive}
            className="btn-danger btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            <AlertTriangle className="w-8 h-8" />
            <span>EMERGÊNCIA</span>
          </button>

          <button
            onClick={handleAddCycle}
            disabled={!anyMachineActive}
            className="btn-primary btn-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-center">
              <div className="text-3xl font-bold">{todayCycles}</div>
              <div className="text-sm">Adicionar Giro</div>
            </div>
          </button>
        </div>

        {/* Blocked Message */}
        {blockedMessage && (
          <div className="bg-yellow-50 border-2 border-yellow-400 text-yellow-800 px-6 py-4 rounded-xl mb-6 flex items-start gap-3">
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

        {/* Machines Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {machines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>

        {machines.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              Nenhuma máquina vinculada ao seu usuário.
            </p>
            <p className="text-gray-400 mt-2">
              Entre em contato com o administrador para configurar suas máquinas.
            </p>
          </div>
        )}
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <EmergencyModal
          onClose={() => setShowEmergencyModal(false)}
          onConfirm={handleEmergencyConfirm}
        />
      )}
    </div>
  );
};

export default OperatorDashboard;
