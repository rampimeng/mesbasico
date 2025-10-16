import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useMachineStore } from '@/store/machineStore';
import { useAuditStore } from '@/store/auditStore';
import { MachineStatus } from '@/types';
import MachineCard from '@/components/Operator/MachineCard';
import EmergencyModal from '@/components/Operator/EmergencyModal';
import { AlertTriangle, LogOut, Play, RefreshCw } from 'lucide-react';

const OperatorDashboard = () => {
  const { user, company, logout } = useAuthStore();
  const { machines, getMachinesByOperator, updateMachineStatus, isMachineInUse } = useMachineStore();
  const { addCycleLog, getTodayCycles } = useAuditStore();

  const [operatorMachines, setOperatorMachines] = useState(getMachinesByOperator(user?.id || ''));
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState('');
  const [todayCycles, setTodayCycles] = useState(getTodayCycles(company?.id || '', user?.id));

  useEffect(() => {
    setOperatorMachines(getMachinesByOperator(user?.id || ''));
    setTodayCycles(getTodayCycles(company?.id || '', user?.id));
  }, [machines, user, company, getMachinesByOperator, getTodayCycles]);

  const handleStartShift = () => {
    // Verificar se alguma máquina já está em uso por outro operador
    const machineInUse = operatorMachines.find((m) => {
      const inUse = isMachineInUse(m.id);
      return inUse && m.currentOperatorId !== user?.id;
    });

    if (machineInUse) {
      setBlockedMessage(
        'O grupo de máquina que você está alocado já está em produção, procure o supervisor.'
      );
      return;
    }

    // Iniciar todas as máquinas
    operatorMachines.forEach((machine) => {
      if (machine.status === MachineStatus.IDLE) {
        updateMachineStatus(machine.id, MachineStatus.NORMAL_RUNNING, user?.id);
      }
    });
  };

  const handleEmergencyStop = () => {
    setShowEmergencyModal(true);
  };

  const handleEmergencyConfirm = (_reasonId: string) => {
    // Parar todas as máquinas em emergência
    operatorMachines.forEach((machine) => {
      if (machine.status !== MachineStatus.IDLE) {
        updateMachineStatus(machine.id, MachineStatus.EMERGENCY, user?.id);
      }
    });
    setShowEmergencyModal(false);
  };

  const handleAddCycle = () => {
    // Registrar giro no log de auditoria
    // Assumindo que o operador está adicionando um giro para a primeira máquina ativa
    const activeMachine = operatorMachines.find(m => m.status === MachineStatus.NORMAL_RUNNING);

    if (activeMachine && user && company) {
      addCycleLog({
        companyId: company.id,
        sessionId: activeMachine.sessionStartedAt?.toISOString() || 'session-' + Date.now(),
        machineId: activeMachine.id,
        operatorId: user.id,
        cycleCompletedAt: new Date(),
        machineName: activeMachine.name,
        operatorName: user.name,
      });

      // Atualizar contador local
      setTodayCycles(getTodayCycles(company.id, user.id));
    }
  };

  const allMachinesRunning = operatorMachines.every(
    (m) => m.status === MachineStatus.NORMAL_RUNNING
  );
  const anyMachineActive = operatorMachines.some(
    (m) => m.status !== MachineStatus.IDLE
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
          {operatorMachines.map((machine) => (
            <MachineCard key={machine.id} machine={machine} />
          ))}
        </div>

        {operatorMachines.length === 0 && (
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
