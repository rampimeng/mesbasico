import { create } from 'zustand';
import { PDCAPlan } from '@/types';

interface PDCAStore {
  plans: PDCAPlan[];
  getPlans: (companyId: string) => PDCAPlan[];
  getPlanById: (id: string) => PDCAPlan | undefined;
  addPlan: (plan: Omit<PDCAPlan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updatePlan: (id: string, plan: Partial<PDCAPlan>) => void;
  deletePlan: (id: string) => void;
  updatePhase: (id: string, phase: PDCAPlan['phase']) => void;
  addAction: (planId: string, action: PDCAPlan['actions'][0]) => void;
  updateAction: (planId: string, actionId: string, updates: Partial<PDCAPlan['actions'][0]>) => void;
  deleteAction: (planId: string, actionId: string) => void;
  initializeMockData: () => void;
}

const mockPlans: PDCAPlan[] = [
  {
    id: 'pdca-1',
    companyId: '1',
    title: 'Redução de Paradas por Falta de Material',
    description: 'Plano para reduzir paradas por falta de matéria-prima em 50%',
    basePeriodStart: new Date('2024-01-01'),
    basePeriodEnd: new Date('2024-01-31'),
    scopeFilters: {
      groupIds: ['1'],
      machineIds: ['1', '2'],
    },
    baselineData: {
      totalProductionTime: 518400, // 144 horas
      totalStopTime: 86400, // 24 horas
      totalCycles: 2880,
      stopReasons: [
        { reasonId: '1', reasonName: 'Falta de Material', duration: 43200, percentage: 50 },
        { reasonId: '2', reasonName: 'Quebra de Ferramenta', duration: 21600, percentage: 25 },
        { reasonId: '3', reasonName: 'Setup de Máquina', duration: 14400, percentage: 16.7 },
        { reasonId: '4', reasonName: 'Manutenção Preventiva', duration: 7200, percentage: 8.3 },
      ],
    },
    targets: {
      targetCycles: 3200,
      targetStopTimeReduction: 50,
    },
    actions: [
      {
        id: 'action-1',
        description: 'Implementar sistema Kanban para reposição automática',
        responsible: 'João Silva',
        deadline: new Date('2024-02-15'),
        completed: true,
        completedAt: new Date('2024-02-10'),
      },
      {
        id: 'action-2',
        description: 'Treinar equipe sobre novo sistema de requisição',
        responsible: 'Maria Santos',
        deadline: new Date('2024-02-20'),
        completed: true,
        completedAt: new Date('2024-02-18'),
      },
      {
        id: 'action-3',
        description: 'Aumentar estoque mínimo de materiais críticos',
        responsible: 'Carlos Ferreira',
        deadline: new Date('2024-02-25'),
        completed: false,
      },
    ],
    phase: 'CHECK',
    comparisonPeriodStart: new Date('2024-03-01'),
    comparisonPeriodEnd: new Date('2024-03-31'),
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-03-01'),
    createdBy: 'admin@empresa.com',
  },
];

export const usePDCAStore = create<PDCAStore>((set, get) => ({
  plans: [],

  getPlans: (companyId) => {
    return get().plans.filter((p) => p.companyId === companyId);
  },

  getPlanById: (id) => {
    return get().plans.find((p) => p.id === id);
  },

  addPlan: (plan) => {
    const newPlan: PDCAPlan = {
      ...plan,
      id: `pdca-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    set((state) => ({ plans: [...state.plans, newPlan] }));
  },

  updatePlan: (id, plan) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, ...plan, updatedAt: new Date() } : p
      ),
    }));
  },

  deletePlan: (id) => {
    set((state) => ({
      plans: state.plans.filter((p) => p.id !== id),
    }));
  },

  updatePhase: (id, phase) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === id ? { ...p, phase, updatedAt: new Date() } : p
      ),
    }));
  },

  addAction: (planId, action) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId
          ? { ...p, actions: [...p.actions, action], updatedAt: new Date() }
          : p
      ),
    }));
  },

  updateAction: (planId, actionId, updates) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              actions: p.actions.map((a) =>
                a.id === actionId ? { ...a, ...updates } : a
              ),
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  deleteAction: (planId, actionId) => {
    set((state) => ({
      plans: state.plans.map((p) =>
        p.id === planId
          ? {
              ...p,
              actions: p.actions.filter((a) => a.id !== actionId),
              updatedAt: new Date(),
            }
          : p
      ),
    }));
  },

  initializeMockData: () => {
    set({ plans: mockPlans });
  },
}));
