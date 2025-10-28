import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MachineStatus } from '@/types';
import { Activity, AlertTriangle } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface Company {
  id: string;
  name: string;
  cnpj: string;
  logoUrl?: string;
  dashboardToken: string;
}

interface Group {
  id: string;
  name: string;
  expectedCyclesPerShift: number;
  uptime: number;
}

interface Matrix {
  id: string;
  machineId: string;
  matrixNumber: number;
  status: string;
}

interface Machine {
  id: string;
  name: string;
  code: string;
  groupId?: string;
  numberOfMatrices: number;
  status: MachineStatus;
  currentOperatorId?: string;
  uptime: number;
  matrices: Matrix[];
}

interface DashboardData {
  company: Company;
  groups: Group[];
  machines: Machine[];
}

const ControlDashboard = () => {
  const { token } = useParams<{ token: string }>();

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Load dashboard data from API
  const loadDashboardData = async () => {
    if (!token) {
      setError('Token não fornecido');
      setLoading(false);
      return;
    }

    try {
      console.log('🔍 Loading dashboard data for token:', token);
      const response = await fetch(`${API_URL}/control-dashboard/data/${token}`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Falha ao carregar dados do dashboard');
      }

      console.log('✅ Dashboard data loaded:', result.data);
      setDashboardData(result.data);
      setError(null);
    } catch (err: any) {
      console.error('❌ Error loading dashboard:', err);
      setError(err.message || 'Erro ao carregar dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();

    // Refresh data every 5 seconds
    const dataInterval = setInterval(loadDashboardData, 5000);

    return () => clearInterval(dataInterval);
  }, [token]);

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getMachineStatusColor = (
    status: MachineStatus,
    hasMatrices: boolean,
    allMatricesRunning: boolean
  ) => {
    // If machine has matrices and status is NORMAL_RUNNING
    if (hasMatrices && status === MachineStatus.NORMAL_RUNNING) {
      // If all matrices running → Green
      if (allMatricesRunning) {
        return 'bg-green-500 border-green-600';
      }
      // If some matrices stopped → Yellow (Partial Operation)
      return 'bg-yellow-500 border-yellow-600';
    }

    // Default status colors (no matrices or other statuses)
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

  const getStatusText = (
    status: MachineStatus,
    hasMatrices: boolean,
    allMatricesRunning: boolean
  ) => {
    // If machine has matrices and status is NORMAL_RUNNING
    if (hasMatrices && status === MachineStatus.NORMAL_RUNNING) {
      // If all matrices running → "OPERANDO"
      if (allMatricesRunning) {
        return 'OPERANDO';
      }
      // If some matrices stopped → "OPERANDO PARCIAL"
      return 'OPERANDO PARCIAL';
    }

    // Default status text (no matrices or other statuses)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          Carregando dashboard...
        </div>
      </div>
    );
  }

  if (error || !dashboardData) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <AlertTriangle className="w-20 h-20 text-red-500 mx-auto mb-4" />
          <div className="text-2xl mb-2">Dashboard não encontrado</div>
          <div className="text-gray-400">{error || 'Token inválido'}</div>
        </div>
      </div>
    );
  }

  const { company, groups, machines } = dashboardData;

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
                      <span className="text-3xl font-bold">{group.uptime}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-6">
                      <div
                        className={`h-6 rounded-full transition-all duration-500 ${
                          group.uptime >= 80
                            ? 'bg-green-500'
                            : group.uptime >= 50
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                        }`}
                        style={{ width: `${group.uptime}%` }}
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
            const isEmergency = machine.status === MachineStatus.EMERGENCY;
            const hasMatrices = machine.numberOfMatrices > 0;
            const runningMatrices = machine.matrices.filter((m) => m.status === 'RUNNING').length;
            const allMatricesRunning = hasMatrices && runningMatrices === machine.numberOfMatrices;

            return (
              <div
                key={machine.id}
                className={`border-4 rounded-xl p-6 ${getMachineStatusColor(
                  machine.status,
                  hasMatrices,
                  allMatricesRunning
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
                    {getStatusText(machine.status, hasMatrices, allMatricesRunning)}
                  </span>
                </div>

                {/* Uptime Bar */}
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-white opacity-90 text-sm">Operação Hoje</span>
                    <span className="text-2xl font-bold">{machine.uptime}%</span>
                  </div>
                  <div className="w-full bg-black bg-opacity-40 rounded-full h-4">
                    <div
                      className="bg-white bg-opacity-90 h-4 rounded-full transition-all duration-500"
                      style={{ width: `${machine.uptime}%` }}
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
