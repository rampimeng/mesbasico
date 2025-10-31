import { Company } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface CreateCompanyRequest {
  name: string;
  cnpj: string;
  email: string;
  contactName: string;
  contactPhone: string;
  logoUrl?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

interface UpdateCompanyRequest {
  name?: string;
  cnpj?: string;
  email?: string;
  contactName?: string;
  contactPhone?: string;
  logoUrl?: string;
  active?: boolean;
}

interface ChangeAdminPasswordRequest {
  newPassword: string;
}

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const companiesService = {
  // Get all companies (Master only)
  async getAll(): Promise<Company[]> {
    const response = await fetch(`${API_URL}/companies`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch companies');
    }

    return data.data;
  },

  // Get single company by ID
  async getById(id: string): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch company');
    }

    return data.data;
  },

  // Create new company
  async create(companyData: CreateCompanyRequest): Promise<Company> {
    const response = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to create company');
    }

    return data.data.company;
  },

  // Update company
  async update(id: string, companyData: UpdateCompanyRequest): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(companyData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to update company');
    }

    return data.data;
  },

  // Toggle company active status
  async toggleStatus(id: string): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}/toggle-status`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to toggle company status');
    }

    return data.data;
  },

  // Change admin password for a company
  async changeAdminPassword(id: string, passwordData: ChangeAdminPasswordRequest): Promise<void> {
    const response = await fetch(`${API_URL}/companies/${id}/change-admin-password`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify(passwordData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to change admin password');
    }
  },

  // Toggle PDCA feature for a company
  async togglePDCA(id: string): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}/toggle-pdca`, {
      method: 'PATCH',
      headers: getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to toggle PDCA feature');
    }

    return data.data;
  },

  // Toggle module for a company (MES, QUALITY, etc.)
  async toggleModule(id: string, module: string): Promise<Company> {
    const response = await fetch(`${API_URL}/companies/${id}/toggle-module`, {
      method: 'PATCH',
      headers: getAuthHeader(),
      body: JSON.stringify({ module }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to toggle module');
    }

    return data.data;
  },

  // Delete company
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/companies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to delete company');
    }
  },
};
