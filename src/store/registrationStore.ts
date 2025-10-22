import { create } from 'zustand';
import { User, Group, Machine, StopReason, Shift } from '@/types';
import { groupsService, machinesService, stopReasonsService, usersService, shiftsService } from '@/services/registrationService';

interface RegistrationStore {
  // Estados
  operators: User[];
  groups: Group[];
  machines: Machine[];
  shifts: Shift[];
  stopReasons: StopReason[];
  loading: boolean;
  error: string | null;

  // Load data from API
  loadGroups: () => Promise<void>;
  loadMachines: () => Promise<void>;
  loadShifts: () => Promise<void>;
  loadStopReasons: () => Promise<void>;
  loadOperators: () => Promise<void>;
  loadAll: () => Promise<void>;

  // Grupos/Células
  getGroups: (companyId: string) => Group[];
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateGroup: (id: string, group: Partial<Group>) => Promise<void>;
  deleteGroup: (id: string) => Promise<void>;

  // Máquinas
  getMachines: (companyId: string) => Machine[];
  addMachine: (machine: any) => Promise<void>;
  updateMachine: (id: string, machine: any) => Promise<void>;
  deleteMachine: (id: string) => Promise<void>;

  // Turnos
  getShifts: (companyId: string) => Shift[];
  addShift: (shift: any) => Promise<void>;
  updateShift: (id: string, shift: any) => Promise<void>;
  deleteShift: (id: string) => Promise<void>;

  // Motivos de Parada
  getStopReasons: (companyId: string) => StopReason[];
  addStopReason: (reason: any) => Promise<void>;
  updateStopReason: (id: string, reason: any) => Promise<void>;
  deleteStopReason: (id: string) => Promise<void>;

  // Operadores
  getOperators: (companyId: string) => User[];
  addOperator: (operator: any) => Promise<void>;
  updateOperator: (id: string, operator: any) => Promise<void>;
  deleteOperator: (id: string) => Promise<void>;
}

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  operators: [],
  groups: [],
  machines: [],
  shifts: [],
  stopReasons: [],
  loading: false,
  error: null,

  // Load functions
  loadGroups: async () => {
    try {
      set({ loading: true, error: null });
      const groups = await groupsService.getAll();
      set({ groups, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadMachines: async () => {
    try {
      set({ loading: true, error: null });
      const machines = await machinesService.getAll();
      set({ machines, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadStopReasons: async () => {
    try {
      set({ loading: true, error: null });
      const stopReasons = await stopReasonsService.getAll();
      set({ stopReasons, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadOperators: async () => {
    try {
      set({ loading: true, error: null });
      const allUsers = await usersService.getAll();
      const operators = allUsers.filter((u: User) => u.role === 'OPERATOR');
      set({ operators, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadShifts: async () => {
    try {
      set({ loading: true, error: null });
      const shifts = await shiftsService.getAll();
      set({ shifts, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  loadAll: async () => {
    await Promise.all([
      get().loadGroups(),
      get().loadMachines(),
      get().loadShifts(),
      get().loadStopReasons(),
      get().loadOperators(),
    ]);
  },

  // Grupos
  getGroups: (companyId) => get().groups.filter((g) => g.companyId === companyId),

  addGroup: async (group) => {
    try {
      const newGroup = await groupsService.create(group);
      set((state) => ({ groups: [...state.groups, newGroup] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateGroup: async (id, group) => {
    try {
      const updated = await groupsService.update(id, group);
      set((state) => ({
        groups: state.groups.map((g) => (g.id === id ? updated : g)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteGroup: async (id) => {
    try {
      await groupsService.delete(id);
      set((state) => ({
        groups: state.groups.filter((g) => g.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Máquinas
  getMachines: (companyId) => get().machines.filter((m) => m.companyId === companyId),

  addMachine: async (machine) => {
    try {
      const newMachine = await machinesService.create(machine);
      set((state) => ({ machines: [...state.machines, newMachine] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateMachine: async (id, machine) => {
    try {
      const updated = await machinesService.update(id, machine);
      set((state) => ({
        machines: state.machines.map((m) => (m.id === id ? updated : m)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteMachine: async (id) => {
    try {
      await machinesService.delete(id);
      set((state) => ({
        machines: state.machines.filter((m) => m.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Turnos
  getShifts: (companyId) => get().shifts.filter((s) => s.companyId === companyId),

  addShift: async (shift) => {
    try {
      const newShift = await shiftsService.create(shift);
      set((state) => ({ shifts: [...state.shifts, newShift] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateShift: async (id, shift) => {
    try {
      const updated = await shiftsService.update(id, shift);
      set((state) => ({
        shifts: state.shifts.map((s) => (s.id === id ? updated : s)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteShift: async (id) => {
    try {
      await shiftsService.delete(id);
      set((state) => ({
        shifts: state.shifts.filter((s) => s.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Motivos de Parada
  getStopReasons: (companyId) => get().stopReasons.filter((sr) => sr.companyId === companyId),

  addStopReason: async (reason) => {
    try {
      const newReason = await stopReasonsService.create(reason);
      set((state) => ({ stopReasons: [...state.stopReasons, newReason] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateStopReason: async (id, reason) => {
    try {
      const updated = await stopReasonsService.update(id, reason);
      set((state) => ({
        stopReasons: state.stopReasons.map((sr) => (sr.id === id ? updated : sr)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteStopReason: async (id) => {
    try {
      await stopReasonsService.delete(id);
      set((state) => ({
        stopReasons: state.stopReasons.filter((sr) => sr.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  // Operadores
  getOperators: (companyId) => get().operators.filter((op) => op.companyId === companyId),

  addOperator: async (operator) => {
    try {
      const newOperator = await usersService.create(operator);
      set((state) => ({ operators: [...state.operators, newOperator] }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  updateOperator: async (id, operator) => {
    try {
      const updated = await usersService.update(id, operator);
      set((state) => ({
        operators: state.operators.map((op) => (op.id === id ? updated : op)),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },

  deleteOperator: async (id) => {
    try {
      await usersService.delete(id);
      set((state) => ({
        operators: state.operators.filter((op) => op.id !== id),
      }));
    } catch (error: any) {
      set({ error: error.message });
      throw error;
    }
  },
}));
