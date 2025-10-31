import api from './api';
import { User, UserRole } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
  mfaCode?: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    companyId?: string;
  };
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
    dashboardToken: string;
    enabledModules?: string[];
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

class AuthService {
  /**
   * Realizar login
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    try {
      const response = await api.post<ApiResponse<LoginResponse>>(
        '/auth/login',
        credentials
      );

      if (response.data.success && response.data.data) {
        const { token, user, company } = response.data.data;

        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));

        if (company) {
          localStorage.setItem('company', JSON.stringify(company));
        }

        return response.data.data;
      }

      throw new Error(response.data.error || 'Login failed');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'An error occurred during login'
      );
    }
  }

  /**
   * Realizar logout
   */
  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Limpar dados locais independente do resultado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('company');
    }
  }

  /**
   * Obter dados do usuário autenticado
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await api.get<ApiResponse<User>>('/auth/me');

      if (response.data.success && response.data.data) {
        // Atualizar dados no localStorage
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
      }

      throw new Error(response.data.error || 'Failed to get user data');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.error ||
        error.message ||
        'An error occurred while fetching user data'
      );
    }
  }

  /**
   * Verificar se o usuário está autenticado
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  /**
   * Obter token do localStorage
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * Obter usuário do localStorage
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Obter empresa do localStorage
   */
  getStoredCompany(): LoginResponse['company'] | null {
    const companyStr = localStorage.getItem('company');
    if (companyStr) {
      try {
        return JSON.parse(companyStr);
      } catch {
        return null;
      }
    }
    return null;
  }
}

export default new AuthService();
