// Enums
export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
}

export enum MachineStatus {
  NORMAL_RUNNING = 'NORMAL_RUNNING', // Giro Normal
  STOPPED = 'STOPPED', // Parada
  EMERGENCY = 'EMERGENCY', // Emergência
  IDLE = 'IDLE', // Ociosa (não iniciada)
}

export enum MatrixStatus {
  RUNNING = 'RUNNING',
  STOPPED = 'STOPPED',
}

// Interfaces
export interface Company {
  id: string;
  name: string;
  cnpj: string;
  active: boolean;
  logoUrl?: string; // URL do logotipo da empresa
  dashboardToken?: string; // Token único para acesso ao dashboard de controle
  pdcaEnabled?: boolean; // Habilita/desabilita funcionalidade PDCA para esta empresa
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  companyId: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  active: boolean;
  mfaEnabled: boolean;
  mfaSecret?: string;
  phone?: string;
  groupIds?: string[]; // Células vinculadas (para operadores)
  createdAt: Date;
  updatedAt: Date;
}

export interface Group {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  cyclesPerShift?: number; // Giros esperados por turno
  operatorIds: string[]; // Operadores vinculados a esta célula
  createdAt: Date;
  updatedAt: Date;
}

export interface Machine {
  id: string;
  companyId: string;
  name: string;
  code: string;
  groupId?: string;
  numberOfMatrices: number; // Quantidade de matrizes
  standardCycleTime: number; // Tempo de ciclo padrão em segundos
  operatorIds: string[]; // Operadores vinculados
  status: MachineStatus;
  currentOperatorId?: string; // Operador que está usando a máquina
  sessionStartedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Matrix {
  id: string;
  machineId: string;
  matrixNumber: number; // Número da matriz (1, 2, 3, etc.)
  status: MatrixStatus;
  currentStopReasonId?: string;
  lastStatusChangeAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface StopReason {
  id: string;
  companyId: string;
  name: string;
  description?: string;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductionSession {
  id: string;
  companyId: string;
  machineId: string;
  operatorId: string;
  startedAt: Date;
  endedAt?: Date;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeLog {
  id: string;
  companyId: string;
  sessionId: string;
  machineId: string;
  matrixId?: string;
  status: MachineStatus | MatrixStatus;
  stopReasonId?: string;
  stopReasonName?: string;
  startedAt: Date;
  endedAt?: Date;
  durationSeconds?: number;
  machineName?: string;
  matrixNumber?: number;
  operatorId?: string;
  operatorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CycleLog {
  id: string;
  companyId: string;
  sessionId: string;
  machineId: string;
  matrixId?: string;
  operatorId: string;
  cycleCompletedAt: Date;
  machineName?: string;
  operatorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CycleTarget {
  id: string;
  companyId: string;
  machineId: string;
  period: string; // 'YYYY-MM-DD' or 'YYYY-MM'
  targetCycles: number; // Meta de ciclos previstos
  createdAt: Date;
  updatedAt: Date;
}

export interface PDCAPlan {
  id: string;
  companyId: string;
  title: string;
  description?: string;
  basePeriodStart: Date;
  basePeriodEnd: Date;

  // Filtros de escopo congelados
  scopeFilters: {
    groupIds?: string[];
    machineIds?: string[];
    operatorIds?: string[];
  };

  // Baseline congelado
  baselineData: {
    totalProductionTime: number;
    totalStopTime: number;
    totalCycles: number;
    stopReasons: Array<{
      reasonId: string;
      reasonName: string;
      duration: number;
      percentage: number;
    }>;
  };

  // Metas
  targets: {
    targetCycles?: number;
    targetProductionTime?: number;
    targetStopTimeReduction?: number;
  };

  // Ações
  actions: Array<{
    id: string;
    description: string;
    responsible?: string;
    deadline?: Date;
    completed: boolean;
    completedAt?: Date;
  }>;

  // Fase do PDCA
  phase: 'PLAN' | 'DO' | 'CHECK' | 'ACT';

  // Período de comparação (para Check)
  comparisonPeriodStart?: Date;
  comparisonPeriodEnd?: Date;

  // Conclusões (para Act)
  conclusions?: string;

  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

export interface DashboardFilters {
  startDate: Date;
  endDate: Date;
  groupIds?: string[];
  machineIds?: string[];
  operatorIds?: string[];
}

export interface ParetoData {
  reasonId: string;
  reasonName: string;
  duration: number;
  percentage: number;
  cumulativePercentage: number;
}

export interface CycleMetrics {
  targetCycles: number;
  completedCycles: number;
  percentage: number;
}

export interface TimeMetrics {
  totalProductionTime: number;
  totalStopTime: number;
  stopTimeByReason: Array<{
    reasonId: string;
    reasonName: string;
    duration: number;
  }>;
}

// Auth Context Types
export interface AuthState {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface MFASetup {
  secret: string;
  qrCode: string;
}
