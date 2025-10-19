const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const filtersService = {
  // Get all groups/cells for filters
  async getGroups() {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch groups');
    return data.data;
  },

  // Get all machines for filters
  async getMachines() {
    const response = await fetch(`${API_URL}/machines`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch machines');
    return data.data;
  },

  // Get all operators for filters
  async getOperators() {
    const response = await fetch(`${API_URL}/users?role=OPERATOR`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch operators');
    return data.data;
  },
};
