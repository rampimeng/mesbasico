import { create } from 'zustand';
import { CycleLog, TimeLog } from '@/types';
import { auditService } from '@/services/auditService';

interface AuditStore {
  cycleLogs: CycleLog[];
  timeLogs: TimeLog[];
  loading: boolean;
  error: string | null;

  // Load from API
  loadCycleLogs: (filters?: any) => Promise<void>;
  loadTimeLogs: (filters?: any) => Promise<void>;

  // Cycle Logs (Giros)
  addCycleLog: (log: Omit<CycleLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getCycleLogs: (companyId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    machineId?: string;
    operatorId?: string;
  }) => CycleLog[];
  deleteCycleLog: (id: string) => Promise<void>;

  // Time Logs (Paradas)
  addTimeLog: (log: Omit<TimeLog, 'id' | 'createdAt' | 'updatedAt'>) => void;
  getTimeLogs: (companyId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    machineId?: string;
    operatorId?: string;
  }) => TimeLog[];
  deleteTimeLog: (id: string) => Promise<void>;

  // Stats
  getTodayCycles: (companyId: string, operatorId?: string) => number;
  getTodayCyclesByGroup: (companyId: string, groupId: string) => number;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  cycleLogs: [],
  timeLogs: [],
  loading: false,
  error: null,

  // Load from API
  loadCycleLogs: async (filters) => {
    try {
      set({ loading: true, error: null });
      const data = await auditService.getCycleLogs(filters);
      set({ cycleLogs: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadTimeLogs: async (filters) => {
    try {
      set({ loading: true, error: null });
      const data = await auditService.getTimeLogs(filters);
      set({ timeLogs: data, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

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

  deleteCycleLog: async (id) => {
    try {
      await auditService.deleteCycleLog(id);
      set((state) => ({
        cycleLogs: state.cycleLogs.filter((log) => log.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
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

  deleteTimeLog: async (id) => {
    try {
      await auditService.deleteTimeLog(id);
      set((state) => ({
        timeLogs: state.timeLogs.filter((log) => log.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
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
