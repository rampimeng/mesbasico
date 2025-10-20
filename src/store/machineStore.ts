import { create } from 'zustand';
import { Machine, Matrix, MachineStatus, MatrixStatus, ProductionSession } from '@/types';
import { machinesService } from '@/services/machinesService';
import { productionService } from '@/services/productionService';

interface MachineStore {
  machines: Machine[];
  matrices: Matrix[];
  activeSessions: ProductionSession[];
  loading: boolean;
  error: string | null;
  loadMyMachines: () => Promise<void>;
  loadAllMachines: () => Promise<void>;
  setMachines: (machines: Machine[]) => void;
  setMatrices: (matrices: Matrix[]) => void;
  updateMachineStatus: (machineId: string, status: MachineStatus, operatorId?: string, stopReasonId?: string) => Promise<void>;
  updateMatrixStatus: (matrixId: string, status: MatrixStatus, stopReasonId?: string) => Promise<void>;
  startSession: (machineId: string, operatorId: string) => Promise<void>;
  endSession: (sessionId: string) => void;
  getMatricesByMachine: (machineId: string) => Matrix[];
  isMachineInUse: (machineId: string) => boolean;
}

const generateMatrices = (machines: Machine[]): Matrix[] => {
  const matrices: Matrix[] = [];
  machines.forEach((machine) => {
    for (let i = 1; i <= machine.numberOfMatrices; i++) {
      matrices.push({
        id: `${machine.id}-mat${i}`,
        machineId: machine.id,
        matrixNumber: i,
        status: MatrixStatus.STOPPED,
        lastStatusChangeAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  });
  return matrices;
};

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: [],
  matrices: [],
  activeSessions: [],
  loading: false,
  error: null,

  loadMyMachines: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔄 Loading my machines...');
      const machines = await machinesService.getMyMachines();
      console.log('✅ Loaded machines:', machines);
      const matrices = generateMatrices(machines);
      set({ machines, matrices, loading: false });
    } catch (error: any) {
      console.error('❌ Error loading machines:', error);
      set({ error: error.message, loading: false });
    }
  },

  loadAllMachines: async () => {
    try {
      set({ loading: true, error: null });
      console.log('🔄 Loading all machines (Admin/Supervisor)...');
      const machines = await machinesService.getAll();
      console.log('✅ Loaded all machines:', machines);
      const matrices = generateMatrices(machines);
      set({ machines, matrices, loading: false });
    } catch (error: any) {
      console.error('❌ Error loading all machines:', error);
      set({ error: error.message, loading: false });
    }
  },

  setMachines: (machines) => {
    const matrices = generateMatrices(machines);
    set({ machines, matrices });
  },

  setMatrices: (matrices) => set({ matrices }),

  updateMachineStatus: async (machineId, status, operatorId, stopReasonId) => {
    try {
      // Call backend API
      await productionService.updateMachineStatus(machineId, status, stopReasonId);

      // Update local state
      set((state) => ({
        machines: state.machines.map((m) =>
          m.id === machineId
            ? {
                ...m,
                status,
                currentOperatorId: status === MachineStatus.IDLE ? undefined : operatorId,
                sessionStartedAt: status === MachineStatus.IDLE ? undefined : new Date(),
              }
            : m
        ),
      }));

      // Atualizar status de todas as matrizes
      if (status === MachineStatus.NORMAL_RUNNING || status === MachineStatus.EMERGENCY) {
        const newMatrixStatus = status === MachineStatus.EMERGENCY ? MatrixStatus.STOPPED : MatrixStatus.RUNNING;
        set((state) => ({
          matrices: state.matrices.map((mat) =>
            mat.machineId === machineId
              ? {
                  ...mat,
                  status: newMatrixStatus,
                  lastStatusChangeAt: new Date(),
                  currentStopReasonId: status === MachineStatus.EMERGENCY ? mat.currentStopReasonId : undefined,
                }
              : mat
          ),
        }));
      }
    } catch (error: any) {
      console.error('❌ Error updating machine status:', error);
      set({ error: error.message });
    }
  },

  updateMatrixStatus: async (matrixId, status, stopReasonId) => {
    try {
      // Get matrix info
      const matrix = get().matrices.find((m) => m.id === matrixId);
      if (!matrix) {
        console.error('❌ Matrix not found:', matrixId);
        return;
      }

      // Call backend API
      await productionService.updateMatrixStatus(
        matrixId,
        matrix.machineId,
        matrix.matrixNumber,
        status,
        stopReasonId
      );

      // Update local state
      set((state) => ({
        matrices: state.matrices.map((mat) =>
          mat.id === matrixId
            ? {
                ...mat,
                status,
                currentStopReasonId: status === MatrixStatus.STOPPED ? stopReasonId : undefined,
                lastStatusChangeAt: new Date(),
              }
            : mat
        ),
      }));
    } catch (error: any) {
      console.error('❌ Error updating matrix status:', error);
      set({ error: error.message });
    }
  },

  startSession: async (machineId, operatorId) => {
    try {
      // Call backend API to start session
      const session = await productionService.startSession(machineId);

      // Update local state
      set((state) => ({
        activeSessions: [...state.activeSessions, session],
        machines: state.machines.map((m) =>
          m.id === machineId
            ? {
                ...m,
                status: MachineStatus.NORMAL_RUNNING,
                currentOperatorId: operatorId,
                sessionStartedAt: new Date(),
              }
            : m
        ),
      }));

      // Update matrices to RUNNING
      set((state) => ({
        matrices: state.matrices.map((mat) =>
          mat.machineId === machineId
            ? {
                ...mat,
                status: MatrixStatus.RUNNING,
                lastStatusChangeAt: new Date(),
              }
            : mat
        ),
      }));
    } catch (error: any) {
      console.error('❌ Error starting session:', error);
      set({ error: error.message });
    }
  },

  endSession: (sessionId) => {
    set((state) => ({
      activeSessions: state.activeSessions.map((session) =>
        session.id === sessionId
          ? { ...session, active: false, endedAt: new Date() }
          : session
      ),
    }));
  },

  getMatricesByMachine: (machineId) => {
    return get().matrices.filter((mat) => mat.machineId === machineId);
  },

  isMachineInUse: (machineId) => {
    const machine = get().machines.find((m) => m.id === machineId);
    return !!machine?.currentOperatorId;
  },
}));
