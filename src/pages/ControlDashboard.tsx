import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useMachineStore } from '@/store/machineStore';
import { useRegistrationStore } from '@/store/registrationStore';
import { Machine, MachineStatus, Group } from '@/types';
import { Activity, AlertTriangle } from 'lucide-react';

const ControlDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const { machines, getMatricesByMachine } = useMachineStore();
  const { getGroups } = useRegistrationStore();

  // Mock: buscar empresa pelo token (em prod, seria uma API call)
  const [company, setCompany] = useState<any>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    // Simular busca da empresa pelo token
    const mockCompanies = [
      {
        id: '1',
        name: 'Empresa Demo LTDA',
        dashboardToken: 'dash_1234567890_abc123def456',
        logoUrl: '',
      },
    ];

    const foundCompany = mockCompanies.find((c) => c.dashboardToken === token);
    if (foundCompany) {
      setCompany(foundCompany);
      setGroups(getGroups(foundCompany.id));
    }
  }, [token, getGroups]);

  // Atualizar tempo em tempo real a cada 1 segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const calculateMachineUptime = (machine: Machine) => {
    // Calcular uptime do dia (mock - em prod seria baseado em logs reais)
    // Simular tempo operante baseado no status atual
    let uptimePercentage = 0;
    if (machine.status === MachineStatus.NORMAL_RUNNING) {
      uptimePercentage = 75 + Math.random() * 20; // 75-95%
    } else if (machine.status === MachineStatus.STOPPED) {
      uptimePercentage = 40 + Math.random() * 30; // 40-70%
    } else {
      uptimePercentage = 10 + Math.random() * 20; // 10-30%
    }

    return Math.min(100, Math.round(uptimePercentage));
  };

  const calculateGroupUptime = (groupId: string) => {
    const groupMachines = machines.filter((m) => m.groupId === groupId);
    if (groupMachines.length === 0) return 0;

    const totalUptime = groupMachines.reduce(
      (sum, machine) => sum + calculateMachineUptime(machine),
      0
    );
    return Math.round(totalUptime / groupMachines.length);
  };

  const getMachineStatusColor = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.NORMAL_RUNNING:
        return 'bg-green-500 border-green-600';
      case MachineStatus.STOPPED:
        return 'bg-yellow-500 border-yellow-600';
      case MachineStatus.EMERGENCY:
        return 'bg-red-600 border-red-700 animate-pulse';
      case MachineStatus.IDLE:
        return 'bg-gray-400 border-gray-500';
      default:
        return 'bg-gray-400 border-gray-500';
    }
  };

  const getStatusText = (status: MachineStatus) => {
    switch (status) {
      case MachineStatus.NORMAL_RUNNING:
        return 'OPERANDO';
      case MachineStatus.STOPPED:
        return 'PARADA';
      case MachineStatus.EMERGENCY:
        return 'EMERGÊNCIA';
      case MachineStatus.IDLE:
        return 'OCIOSA';
      default:
        return 'DESCONHECIDO';
    }
  };

  if (!company) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">Dashboard não encontrado</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      {/* Header */}
      <header className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt="Logo"
              className="h-16 object-contain"
            />
          ) : (
            <div className="w-16 h-16 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-10 h-10" />
            </div>
          )}
          <div>
            <h1 className="text-4xl font-bold">{company.name}</h1>
            <p className="text-gray-400 text-lg">Dashboard de Controle - Tempo Real</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Atualizado em:</p>
          <p className="text-2xl font-mono">{currentTime.toLocaleTimeString('pt-BR')}</p>
        </div>
      </header>

      {/* Groups/Cells */}
      {groups.length > 0 && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-6 h-6" />
            Células de Produção
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => {
              const groupMachines = machines.filter((m) => m.groupId === group.id);
              const uptime = calculateGroupUptime(group.id);
              const hasEmergency = groupMachines.some(
                (m) => m.status === MachineStatus.EMERGENCY
              );

              return (
                <div
                  key={group.id}
                  className={`bg-gray-800 border-4 rounded-xl p-6 ${
                    hasEmergency
                      ? 'border-red-600 animate-pulse'
                      : 'border-gray-700'
                  }`}
                >
                  <h3 className="text-2xl font-bold mb-4">{group.name}</h3>

                  {/* Uptime Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Operação Hoje</span>
                      <span className="text-3xl font-bold">{uptime}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full transition-all duration-500 ${
                          uptime >= 80
                            ? 'bg-green-500'
                            : uptime >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${uptime}%` }}
                      />
                    </div>
                  </div>

                  {/* Machines Count */}
                  <p className="text-gray-400 text-lg">
                    {groupMachines.length} máquina(s)
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All Machines */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <Activity className="w-6 h-6" />
          Todas as Máquinas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {machines.map((machine) => {
            const uptime = calculateMachineUptime(machine);
            const isEmergency = machine.status === MachineStatus.EMERGENCY;
            const matrices = getMatricesByMachine(machine.id);
            const runningMatrices = matrices.filter((m) => m.status === 'RUNNING').length;

            return (
              <div
                key={machine.id}
                className={`border-4 rounded-xl p-6 ${getMachineStatusColor(
                  machine.status
                )}`}
              >
                {/* Machine Name */}
                <h3 className="text-3xl font-bold mb-2 text-center">
                  {machine.name}
                </h3>

                {/* Status Badge */}
                <div className="text-center mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 bg-black bg-opacity-50 rounded-lg text-2xl font-bold">
                    {isEmergency && <AlertTriangle className="w-6 h-6" />}
                    {getStatusText(machine.status)}
                  </span>
                </div>

                {/* Uptime Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-white opacity-90 text-sm">Operação Hoje</span>
                    <span className="text-2xl font-bold">{uptime}%</span>
                  </div>
                  <div className="w-full bg-black bg-opacity-40 rounded-full h-4">
                    <div
                      className="bg-white bg-opacity-90 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${uptime}%` }}
                    />
                  </div>
                </div>

                {/* Matrices Info */}
                {machine.numberOfMatrices > 0 && (
                  <div className="text-center text-lg">
                    <p className="text-white opacity-90">
                      Matrizes: {runningMatrices}/{machine.numberOfMatrices}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {machines.length === 0 && (
        <div className="text-center py-20">
          <p className="text-gray-400 text-2xl">Nenhuma máquina cadastrada</p>
        </div>
      )}
    </div>
  );
};

export default ControlDashboard;
