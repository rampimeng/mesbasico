import { create } from 'zustand';
import { CycleLog, TimeLog, MatrixStatus } from '@/types';

interface AuditStore {
  cycleLogs: CycleLog[];
  timeLogs: TimeLog[];

  // Cycle Logs (Giros)
  addCycleLog: (log: Omit<CycleLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getCycleLogs: (companyId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    machineId?: string;
    operatorId?: string;
  }) => CycleLog[];
  deleteCycleLog: (id: string) => void;

  // Time Logs (Paradas)
  addTimeLog: (log: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getTimeLogs: (companyId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    machineId?: string;
    operatorId?: string;
  }) => TimeLog[];
  deleteTimeLog: (id: string) => void;

  // Stats
  getTodayCycles: (companyId: string, operatorId?: string) => number;
  getTodayCyclesByGroup: (companyId: string, groupId: string) => number;
}

// Mock data inicial
const mockCycleLogs: CycleLog[] = [
  {
    id: 'cycle-1',
    companyId: '1',
    sessionId: 'session-1',
    machineId: 'm1',
    operatorId: '4',
    cycleCompletedAt: new Date(new Date().setHours(8, 30, 0)),
    machineName: 'Injetora 01',
    operatorName: 'Operador João',
    createdAt: new Date(new Date().setHours(8, 30, 0)),
    updatedAt: new Date(new Date().setHours(8, 30, 0)),
  },
  {
    id: 'cycle-2',
    companyId: '1',
    sessionId: 'session-1',
    machineId: 'm1',
    operatorId: '4',
    cycleCompletedAt: new Date(new Date().setHours(9, 15, 0)),
    machineName: 'Injetora 01',
    operatorName: 'Operador João',
    createdAt: new Date(new Date().setHours(9, 15, 0)),
    updatedAt: new Date(new Date().setHours(9, 15, 0)),
  },
];

const mockTimeLogs: TimeLog[] = [
  {
    id: 'time-1',
    companyId: '1',
    sessionId: 'session-1',
    machineId: 'm1',
    matrixId: 'm1-mat1',
    status: MatrixStatus.STOPPED,
    stopReasonId: 'r1',
    stopReasonName: 'Troca de Matriz',
    startedAt: new Date(new Date().setHours(10, 0, 0)),
    endedAt: new Date(new Date().setHours(10, 15, 0)),
    durationSeconds: 900,
    machineName: 'Injetora 01',
    matrixNumber: 1,
    operatorId: '4',
    operatorName: 'Operador João',
    createdAt: new Date(new Date().setHours(10, 0, 0)),
    updatedAt: new Date(new Date().setHours(10, 15, 0)),
  },
];

export const useAuditStore = create<AuditStore>((set, get) => ({
  cycleLogs: mockCycleLogs,
  timeLogs: mockTimeLogs,

  // Cycle Logs
  addCycleLog: (log) => {
    const newLog: CycleLog = {
      ...log,
      id: `cycle-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      cycleLogs: [...state.cycleLogs, newLog],
    }));
  },

  getCycleLogs: (companyId, filters) => {
    let logs = get().cycleLogs.filter((log) => log.companyId === companyId);

    if (filters?.startDate) {
      logs = logs.filter((log) => new Date(log.cycleCompletedAt) >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((log) => new Date(log.cycleCompletedAt) <= filters.endDate!);
    }
    if (filters?.machineId) {
      logs = logs.filter((log) => log.machineId === filters.machineId);
    }
    if (filters?.operatorId) {
      logs = logs.filter((log) => log.operatorId === filters.operatorId);
    }

    return logs.sort((a, b) => new Date(b.cycleCompletedAt).getTime() - new Date(a.cycleCompletedAt).getTime());
  },

  deleteCycleLog: (id) => {
    set((state) => ({
      cycleLogs: state.cycleLogs.filter((log) => log.id !== id),
    }));
  },

  // Time Logs
  addTimeLog: (log) => {
    const newLog: TimeLog = {
      ...log,
      id: `time-${Date.now()}-${Math.random()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({
      timeLogs: [...state.timeLogs, newLog],
    }));
  },

  getTimeLogs: (companyId, filters) => {
    let logs = get().timeLogs.filter((log) => log.companyId === companyId);

    if (filters?.startDate) {
      logs = logs.filter((log) => new Date(log.startedAt) >= filters.startDate!);
    }
    if (filters?.endDate) {
      logs = logs.filter((log) => new Date(log.startedAt) <= filters.endDate!);
    }
    if (filters?.machineId) {
      logs = logs.filter((log) => log.machineId === filters.machineId);
    }
    if (filters?.operatorId) {
      logs = logs.filter((log) => log.operatorId === filters.operatorId);
    }

    return logs.sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());
  },

  deleteTimeLog: (id) => {
    set((state) => ({
      timeLogs: state.timeLogs.filter((log) => log.id !== id),
    }));
  },

  // Stats
  getTodayCycles: (companyId, operatorId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let logs = get().cycleLogs.filter((log) =>
      log.companyId === companyId &&
      new Date(log.cycleCompletedAt) >= today
    );

    if (operatorId) {
      logs = logs.filter((log) => log.operatorId === operatorId);
    }

    return logs.length;
  },

  getTodayCyclesByGroup: (companyId, _groupId) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Aqui você precisaria filtrar por grupo - simplificado por enquanto
    const logs = get().cycleLogs.filter((log) =>
      log.companyId === companyId &&
      new Date(log.cycleCompletedAt) >= today
    );

    return logs.length;
  },
}));
