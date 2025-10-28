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
  updateMatrixStatus: (matrixId: string, status: MatrixStatus, stopReasonId?: string, operatorId?: string) => Promise<void>;
  startSession: (machineId: string, operatorId: string) => Promise<void>;
  endSession: (sessionId: string) => void;
  getMatricesByMachine: (machineId: string) => Matrix[];
  isMachineInUse: (machineId: string) => boolean;
}

const extractMatrices = (machines: Machine[]): Matrix[] => {
  const allMatrices: Matrix[] = [];

  machines.forEach((machine: any) => {
    // If machine already has matrices from backend, use them
    if (machine.matrices && Array.isArray(machine.matrices) && machine.matrices.length > 0) {
      console.log(`✅ Using ${machine.matrices.length} matrices from backend for machine ${machine.name}`);
      machine.matrices.forEach((matrix: any) => {
        allMatrices.push({
          id: matrix.id,
          machineId: machine.id,
          matrixNumber: matrix.matrixNumber,
          status: matrix.status as MatrixStatus,
          currentStopReasonId: matrix.currentStopReasonId,
          lastStatusChangeAt: matrix.updatedAt ? new Date(matrix.updatedAt) : new Date(),
          createdAt: matrix.createdAt ? new Date(matrix.createdAt) : new Date(),
          updatedAt: matrix.updatedAt ? new Date(matrix.updatedAt) : new Date(),
        });
      });
    }
    // Fallback: Generate matrices if not provided by backend (backward compatibility)
    else if (machine.numberOfMatrices > 0) {
      console.log(`⚠️ Generating ${machine.numberOfMatrices} matrices for machine ${machine.name} (backward compatibility)`);
      for (let i = 1; i <= machine.numberOfMatrices; i++) {
        allMatrices.push({
          id: `${machine.id}-mat${i}`,
          machineId: machine.id,
          matrixNumber: i,
          status: MatrixStatus.STOPPED,
          lastStatusChangeAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }
  });

  return allMatrices;
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
      const matrices = extractMatrices(machines);
      console.log('🔢 Extracted matrices:', matrices);
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
      const matrices = extractMatrices(machines);
      console.log('🔢 Extracted matrices:', matrices);
      set({ machines, matrices, loading: false });
    } catch (error: any) {
      console.error('❌ Error loading all machines:', error);
      set({ error: error.message, loading: false });
    }
  },

  setMachines: (machines) => {
    const matrices = extractMatrices(machines);
    set({ machines, matrices });
  },

  setMatrices: (matrices) => set({ matrices }),

  updateMachineStatus: async (machineId, status, operatorId, stopReasonId) => {
    try {
      // Call backend API - pass operatorId
      await productionService.updateMachineStatus(machineId, status, stopReasonId, operatorId);

      // Reload machines from backend to get updated state
      console.log('🔄 Reloading machines after status update...');
      await get().loadMyMachines();
      console.log('✅ Machines reloaded');
    } catch (error: any) {
      console.error('❌ Error updating machine status:', error);
      set({ error: error.message });
    }
  },

  updateMatrixStatus: async (matrixId, status, stopReasonId, operatorId) => {
    try {
      // Get matrix info
      const matrix = get().matrices.find((m) => m.id === matrixId);
      if (!matrix) {
        console.error('❌ Matrix not found:', matrixId);
        return;
      }

      // Call backend API - pass operatorId
      await productionService.updateMatrixStatus(
        matrixId,
        matrix.machineId,
        matrix.matrixNumber,
        status,
        stopReasonId,
        operatorId
      );

      // Reload machines from backend to get updated state
      console.log('🔄 Reloading machines after matrix status update...');
      await get().loadMyMachines();
      console.log('✅ Machines reloaded');
    } catch (error: any) {
      console.error('❌ Error updating matrix status:', error);
      set({ error: error.message });
    }
  },

  startSession: async (machineId, operatorId) => {
    try {
      // Call backend API to start session - pass operatorId
      const session = await productionService.startSession(machineId, operatorId);

      // Add session to local state
      set((state) => ({
        activeSessions: [...state.activeSessions, session],
      }));

      // Reload machines from backend to get updated state
      console.log('🔄 Reloading machines after starting session...');
      await get().loadMyMachines();
      console.log('✅ Machines reloaded');
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
