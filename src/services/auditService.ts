const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const auditService = {
  // Get cycle logs (registros de giros)
  async getCycleLogs(filters?: {
    startDate?: string;
    endDate?: string;
    machineId?: string;
    operatorId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId);
    if (filters?.operatorId) params.append('operatorId', filters.operatorId);

    const url = `${API_URL}/audit/cycles${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  // Get time logs (registros de paradas)
  async getTimeLogs(filters?: {
    startDate?: string;
    endDate?: string;
    machineId?: string;
    operatorId?: string;
  }) {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.machineId) params.append('machineId', filters.machineId);
    if (filters?.operatorId) params.append('operatorId', filters.operatorId);

    const url = `${API_URL}/audit/time-logs${params.toString() ? `?${params.toString()}` : ''}`;

    const response = await fetch(url, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  // Delete cycle log
  async deleteCycleLog(id: string) {
    const response = await fetch(`${API_URL}/audit/cycles/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },

  // Delete time log
  async deleteTimeLog(id: string) {
    const response = await fetch(`${API_URL}/audit/time-logs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },
};
