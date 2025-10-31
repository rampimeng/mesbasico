import { create } from 'zustand';
import { User, Company, LoginCredentials } from '@/types';
import authService from '@/services/auth.service';

interface AuthStore {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  appLogoUrl: string; // URL do logotipo do aplicativo (global)
  setUser: (user: User | null) => void;
  setCompany: (company: Company | null) => void;
  setAppLogoUrl: (url: string) => void;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  company: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  appLogoUrl: '', // Será carregado do localStorage

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  setCompany: (company) => set({ company }),

  setAppLogoUrl: (url) => {
    localStorage.setItem('appLogoUrl', url);
    set({ appLogoUrl: url });
  },

  clearError: () => set({ error: null }),

  login: async (credentials) => {
    set({ isLoading: true, error: null });

    try {
      const response = await authService.login({
        email: credentials.email,
        password: credentials.password,
        mfaCode: credentials.mfaCode,
      });

      // Converter os dados da API para o formato do store
      const user: User = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        role: response.user.role,
        companyId: response.user.companyId || '',
        active: true,
        mfaEnabled: false,
        password: '', // Não armazenar senha no frontend
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      let company: Company | null = null;
      if (response.company) {
        // Debug: verificar enabledModules no login
        console.log('🔍 Login Debug - enabledModules recebido:', {
          enabledModules: response.company.enabledModules,
          companyId: response.company.id,
        });
        
        company = {
          id: response.company.id,
          name: response.company.name,
          cnpj: '', // Não vem na resposta de login
          active: true,
          enabledModules: response.company.enabledModules || [], // Módulos habilitados
          logoUrl: response.company.logoUrl,
          dashboardToken: response.company.dashboardToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        console.log('🔍 Login Debug - company criado:', {
          enabledModules: company.enabledModules,
          hasMaintenance: company.enabledModules?.includes('MANUTENÇÃO'),
        });
      }

      set({
        user,
        company,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || 'Erro ao fazer login',
        user: null,
        company: null,
        isAuthenticated: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      set({
        user: null,
        company: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  checkAuth: async () => {
    const appLogoUrl = localStorage.getItem('appLogoUrl') || '';

    if (!authService.isAuthenticated()) {
      set({
        user: null,
        company: null,
        isAuthenticated: false,
        appLogoUrl,
      });
      return;
    }

    set({ isLoading: true });

    try {
      // Tentar obter dados atualizados do usuário
      const userData = await authService.getCurrentUser();

      const user: User = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
        companyId: userData.companyId,
        active: userData.active ?? true,
        mfaEnabled: userData.mfaEnabled ?? false,
        password: '',
        createdAt: userData.createdAt ? new Date(userData.createdAt) : new Date(),
        updatedAt: userData.updatedAt ? new Date(userData.updatedAt) : new Date(),
      };

      // Carregar empresa do localStorage
      const storedCompany = authService.getStoredCompany();
      let company: Company | null = null;

      if (storedCompany) {
        company = {
          id: storedCompany.id,
          name: storedCompany.name,
          cnpj: '',
          active: true,
          enabledModules: storedCompany.enabledModules || [], // Módulos habilitados
          logoUrl: storedCompany.logoUrl,
          dashboardToken: storedCompany.dashboardToken,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }

      set({
        user,
        company,
        isAuthenticated: true,
        isLoading: false,
        appLogoUrl,
      });
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);

      // Se falhar, tentar usar dados do localStorage
      const storedUser = authService.getStoredUser();
      const storedCompany = authService.getStoredCompany();

      if (storedUser) {
        let company: Company | null = null;

        if (storedCompany) {
          company = {
            id: storedCompany.id,
            name: storedCompany.name,
            cnpj: '',
            active: true,
            enabledModules: storedCompany.enabledModules || [], // Módulos habilitados
            logoUrl: storedCompany.logoUrl,
            dashboardToken: storedCompany.dashboardToken,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }

        set({
          user: storedUser,
          company,
          isAuthenticated: true,
          isLoading: false,
          appLogoUrl,
        });
      } else {
        // Sem dados válidos, fazer logout
        await authService.logout();
        set({
          user: null,
          company: null,
          isAuthenticated: false,
          isLoading: false,
          appLogoUrl,
        });
      }
    }
  },
}));
