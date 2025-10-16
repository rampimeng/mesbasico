import { create } from 'zustand';
import { Machine, Matrix, MachineStatus, MatrixStatus, ProductionSession } from '@/types';

interface MachineStore {
  machines: Machine[];
  matrices: Matrix[];
  activeSessions: ProductionSession[];
  setMachines: (machines: Machine[]) => void;
  setMatrices: (matrices: Matrix[]) => void;
  updateMachineStatus: (machineId: string, status: MachineStatus, operatorId?: string) => void;
  updateMatrixStatus: (matrixId: string, status: MatrixStatus, stopReasonId?: string) => void;
  startSession: (machineId: string, operatorId: string) => void;
  endSession: (sessionId: string) => void;
  getMachinesByOperator: (operatorId: string) => Machine[];
  getMatricesByMachine: (machineId: string) => Matrix[];
  isMachineInUse: (machineId: string) => boolean;
}

// Mock data
const mockMachines: Machine[] = [
  {
    id: 'm1',
    companyId: '1',
    name: 'Injetora 01',
    code: 'INJ-001',
    groupId: 'g1',
    numberOfMatrices: 4,
    standardCycleTime: 120, // 2 minutos
    operatorIds: ['4'], // Operador João
    status: MachineStatus.IDLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'm2',
    companyId: '1',
    name: 'Injetora 02',
    code: 'INJ-002',
    groupId: 'g1',
    numberOfMatrices: 3,
    standardCycleTime: 90,
    operatorIds: ['4'],
    status: MachineStatus.IDLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'm3',
    companyId: '1',
    name: 'Soprador 01',
    code: 'SOP-001',
    groupId: 'g2',
    numberOfMatrices: 2,
    standardCycleTime: 60,
    operatorIds: ['4'],
    status: MachineStatus.IDLE,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

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
  machines: mockMachines,
  matrices: generateMatrices(mockMachines),
  activeSessions: [],

  setMachines: (machines) => set({ machines }),

  setMatrices: (matrices) => set({ matrices }),

  updateMachineStatus: (machineId, status, operatorId) => {
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
  },

  updateMatrixStatus: (matrixId, status, stopReasonId) => {
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
  },

  startSession: (machineId, operatorId) => {
    const newSession: ProductionSession = {
      id: `session-${Date.now()}`,
      companyId: '1',
      machineId,
      operatorId,
      startedAt: new Date(),
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    set((state) => ({
      activeSessions: [...state.activeSessions, newSession],
    }));

    get().updateMachineStatus(machineId, MachineStatus.NORMAL_RUNNING, operatorId);
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

  getMachinesByOperator: (operatorId) => {
    return get().machines.filter((m) => m.operatorIds.includes(operatorId));
  },

  getMatricesByMachine: (machineId) => {
    return get().matrices.filter((mat) => mat.machineId === machineId);
  },

  isMachineInUse: (machineId) => {
    const machine = get().machines.find((m) => m.id === machineId);
    return !!machine?.currentOperatorId;
  },
}));
