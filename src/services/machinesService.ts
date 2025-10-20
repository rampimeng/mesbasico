const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const machinesService = {
  // Get machines for the current operator
  async getMyMachines() {
    console.log('🔍 Fetching my machines from:', `${API_URL}/machines/operator/my-machines`);
    const response = await fetch(`${API_URL}/machines/operator/my-machines`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 My machines response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to fetch machines');
    return data.data;
  },

  // Get all machines (Admin/Supervisor)
  async getAll() {
    console.log('🔍 Fetching ALL machines from:', `${API_URL}/machines`);
    const response = await fetch(`${API_URL}/machines`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 All machines response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to fetch machines');
    return data.data;
  },
};
