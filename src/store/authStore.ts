import { create } from 'zustand';
import { User, Company, LoginCredentials, UserRole } from '@/types';

interface AuthStore {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  appLogoUrl: string; // URL do logotipo do aplicativo (global)
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setAppLogoUrl: (url: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

// Mock data para demonstração
const mockCompanies: Company[] = [
  {
    id: '1',
    name: 'Empresa Demo LTDA',
    cnpj: '12.345.678/0001-90',
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockUsers: User[] = [
  {
    id: '1',
    companyId: '1',
    name: 'Master User',
    email: 'master@mes.com',
    password: 'master123',
    role: UserRole.MASTER,
    active: true,
    mfaEnabled: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    companyId: '1',
    name: 'Admin User',
    email: 'admin@empresa.com',
    password: 'admin123',
    role: UserRole.ADMIN,
    active: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    companyId: '1',
    name: 'Supervisor User',
    email: 'supervisor@empresa.com',
    password: 'super123',
    role: UserRole.SUPERVISOR,
    active: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '4',
    companyId: '1',
    name: 'Operador João',
    email: 'operador@empresa.com',
    password: 'oper123',
    role: UserRole.OPERATOR,
    active: true,
    mfaEnabled: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: false,
  appLogoUrl: '', // Será carregado do localStorage

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setCompany: (company) => set({ company }),

  setAppLogoUrl: (url) => {
    localStorage.setItem('appLogoUrl', url);
    set({ appLogoUrl: url });
  },

  login: async (credentials) => {
    set({ isLoading: true });

    try {
      // Simular requisição de API
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const user = mockUsers.find(
        (u) => u.email === credentials.email && u.password === credentials.password
      );

      if (!user) {
        throw new Error('Credenciais inválidas');
      }

      if (!user.active) {
        throw new Error('Usuário inativo');
      }

      // Verificar MFA se necessário
      if (user.mfaEnabled && user.role === UserRole.MASTER) {
        if (!credentials.mfaCode || credentials.mfaCode !== '123456') {
          throw new Error('Código MFA inválido');
        }
      }

      const company = mockCompanies.find((c) => c.id === user.companyId);

      // Salvar no localStorage
      localStorage.setItem('user', JSON.stringify(user));
      if (company) {
        localStorage.setItem('company', JSON.stringify(company));
      }

      set({
        user,
        company: company || null,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('company');
    set({
      user: null,
      company: null,
      isAuthenticated: false,
    });
  },

  checkAuth: () => {
    const userStr = localStorage.getItem('user');
    const companyStr = localStorage.getItem('company');
    const appLogoUrl = localStorage.getItem('appLogoUrl') || '';

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        const company = companyStr ? JSON.parse(companyStr) : null;
        set({
          user,
          company,
          isAuthenticated: true,
          appLogoUrl,
        });
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('company');
      }
    } else {
      // Carregar logo do app mesmo sem usuário logado (para tela de login)
      set({ appLogoUrl });
    }
  },
}));
