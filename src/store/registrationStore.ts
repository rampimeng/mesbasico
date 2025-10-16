import { create } from 'zustand';
import { User, Group, Machine, StopReason, UserRole, MachineStatus } from '@/types';

interface RegistrationStore {
  // Estados
  operators: User[];
  groups: Group[];
  machines: Machine[];
  stopReasons: StopReason[];

  // Operadores
  getOperators: (companyId: string) => User[];
  addOperator: (operator: Omit<User, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateOperator: (id: string, operator: Partial<User>) => void;
  deleteOperator: (id: string) => void;

  // Grupos/Células
  getGroups: (companyId: string) => Group[];
  addGroup: (group: Omit<Group, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateGroup: (id: string, group: Partial<Group>) => void;
  deleteGroup: (id: string) => void;

  // Máquinas
  getMachines: (companyId: string) => Machine[];
  addMachine: (machine: Omit<Machine, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => void;
  updateMachine: (id: string, machine: Partial<Machine>) => void;
  deleteMachine: (id: string) => void;

  // Motivos de Parada
  getStopReasons: (companyId: string) => StopReason[];
  addStopReason: (reason: Omit<StopReason, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateStopReason: (id: string, reason: Partial<StopReason>) => void;
  deleteStopReason: (id: string) => void;

  // Inicialização
  initializeMockData: () => void;
}

// Mock data inicial
const mockOperators: User[] = [
  {
    id: '4',
    companyId: '1',
    name: 'Operador João',
    email: 'operador@empresa.com',
    password: 'oper123',
    role: UserRole.OPERATOR,
    active: true,
    mfaEnabled: false,
    phone: '(11) 98765-4321',
    groupIds: ['1'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
  {
    id: '5',
    companyId: '1',
    name: 'Maria Silva',
    email: 'maria.silva@empresa.com',
    password: 'maria123',
    role: UserRole.OPERATOR,
    active: true,
    mfaEnabled: false,
    phone: '(11) 98765-1234',
    groupIds: ['1', '2'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '6',
    companyId: '1',
    name: 'Carlos Santos',
    email: 'carlos.santos@empresa.com',
    password: 'carlos123',
    role: UserRole.OPERATOR,
    active: true,
    mfaEnabled: false,
    phone: '(11) 98765-5678',
    groupIds: ['2'],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-01'),
  },
];

const mockGroups: Group[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Célula de Injeção',
    description: 'Máquinas de injeção plástica',
    cyclesPerShift: 480, // Meta de 480 giros por turno (8 horas)
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    companyId: '1',
    name: 'Célula de Montagem',
    description: 'Área de montagem e acabamento',
    cyclesPerShift: 600, // Meta de 600 giros por turno (8 horas)
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

const mockMachines: Machine[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Injetora 01',
    code: 'INJ-001',
    groupId: '1',
    numberOfMatrices: 4,
    standardCycleTime: 120, // 2 minutos
    operatorIds: ['4', '5'],
    status: MachineStatus.IDLE,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '2',
    companyId: '1',
    name: 'Injetora 02',
    code: 'INJ-002',
    groupId: '1',
    numberOfMatrices: 2,
    standardCycleTime: 90, // 1.5 minutos
    operatorIds: ['4'],
    status: MachineStatus.IDLE,
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-12'),
  },
  {
    id: '3',
    companyId: '1',
    name: 'Montadora 01',
    code: 'MNT-001',
    groupId: '2',
    numberOfMatrices: 0,
    standardCycleTime: 60, // 1 minuto
    operatorIds: ['5', '6'],
    status: MachineStatus.IDLE,
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
  },
];

const mockStopReasons: StopReason[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Falta de Material',
    description: 'Ausência de matéria-prima',
    category: 'Material',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '2',
    companyId: '1',
    name: 'Quebra de Ferramenta',
    description: 'Ferramental danificado',
    category: 'Manutenção',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '3',
    companyId: '1',
    name: 'Setup de Máquina',
    description: 'Troca de setup',
    category: 'Processo',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '4',
    companyId: '1',
    name: 'Manutenção Preventiva',
    description: 'Manutenção programada',
    category: 'Manutenção',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
  {
    id: '5',
    companyId: '1',
    name: 'Problema de Qualidade',
    description: 'Não conformidade detectada',
    category: 'Qualidade',
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-10'),
  },
];

export const useRegistrationStore = create<RegistrationStore>((set, get) => ({
  operators: [],
  groups: [],
  machines: [],
  stopReasons: [],

  // Operadores
  getOperators: (companyId) => {
    return get().operators.filter((op) => op.companyId === companyId && op.role === UserRole.OPERATOR);
  },

  addOperator: (operator) => {
    const newOperator: User = {
      ...operator,
      id: `op-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ operators: [...state.operators, newOperator] }));
  },

  updateOperator: (id, operator) => {
    set((state) => ({
      operators: state.operators.map((op) =>
        op.id === id ? { ...op, ...operator, updatedAt: new Date() } : op
      ),
    }));
  },

  deleteOperator: (id) => {
    set((state) => ({
      operators: state.operators.filter((op) => op.id !== id),
    }));
  },

  // Grupos/Células
  getGroups: (companyId) => {
    return get().groups.filter((g) => g.companyId === companyId);
  },

  addGroup: (group) => {
    const newGroup: Group = {
      ...group,
      id: `grp-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ groups: [...state.groups, newGroup] }));
  },

  updateGroup: (id, group) => {
    set((state) => ({
      groups: state.groups.map((g) =>
        g.id === id ? { ...g, ...group, updatedAt: new Date() } : g
      ),
    }));
  },

  deleteGroup: (id) => {
    set((state) => ({
      groups: state.groups.filter((g) => g.id !== id),
    }));
  },

  // Máquinas
  getMachines: (companyId) => {
    return get().machines.filter((m) => m.companyId === companyId);
  },

  addMachine: (machine) => {
    const newMachine: Machine = {
      ...machine,
      id: `maq-${Date.now()}`,
      status: MachineStatus.IDLE,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ machines: [...state.machines, newMachine] }));
  },

  updateMachine: (id, machine) => {
    set((state) => ({
      machines: state.machines.map((m) =>
        m.id === id ? { ...m, ...machine, updatedAt: new Date() } : m
      ),
    }));
  },

  deleteMachine: (id) => {
    set((state) => ({
      machines: state.machines.filter((m) => m.id !== id),
    }));
  },

  // Motivos de Parada
  getStopReasons: (companyId) => {
    return get().stopReasons.filter((sr) => sr.companyId === companyId);
  },

  addStopReason: (reason) => {
    const newReason: StopReason = {
      ...reason,
      id: `sr-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ stopReasons: [...state.stopReasons, newReason] }));
  },

  updateStopReason: (id, reason) => {
    set((state) => ({
      stopReasons: state.stopReasons.map((sr) =>
        sr.id === id ? { ...sr, ...reason, updatedAt: new Date() } : sr
      ),
    }));
  },

  deleteStopReason: (id) => {
    set((state) => ({
      stopReasons: state.stopReasons.filter((sr) => sr.id !== id),
    }));
  },

  // Inicialização com mock data
  initializeMockData: () => {
    set({
      operators: mockOperators,
      groups: mockGroups,
      machines: mockMachines,
      stopReasons: mockStopReasons,
    });
  },
}));
