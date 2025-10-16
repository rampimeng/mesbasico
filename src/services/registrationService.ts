const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// Groups
export const groupsService = {
  async getAll() {
    const response = await fetch(`${API_URL}/groups`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async create(group: any) {
    const response = await fetch(`${API_URL}/groups`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(group),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async update(id: string, group: any) {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(group),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/groups/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },
};

// Machines
export const machinesService = {
  async getAll() {
    console.log('🔍 Fetching all machines from:', `${API_URL}/machines`);
    const response = await fetch(`${API_URL}/machines`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 Machines response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async create(machine: any) {
    console.log('🔍 Creating machine:', { url: `${API_URL}/machines`, machine });
    const response = await fetch(`${API_URL}/machines`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(machine),
    });
    const data = await response.json();
    console.log('📦 Create machine response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async update(id: string, machine: any) {
    const response = await fetch(`${API_URL}/machines/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(machine),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/machines/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },
};

// Stop Reasons
export const stopReasonsService = {
  async getAll() {
    const response = await fetch(`${API_URL}/stop-reasons`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async create(stopReason: any) {
    const response = await fetch(`${API_URL}/stop-reasons`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(stopReason),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async update(id: string, stopReason: any) {
    const response = await fetch(`${API_URL}/stop-reasons/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(stopReason),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/stop-reasons/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },
};

// Users
export const usersService = {
  async getAll() {
    const response = await fetch(`${API_URL}/users`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async create(user: any) {
    const response = await fetch(`${API_URL}/users`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async update(id: string, user: any) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(user),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },

  async delete(id: string) {
    const response = await fetch(`${API_URL}/users/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
  },

  async getOperatorGroups(id: string) {
    const response = await fetch(`${API_URL}/users/${id}/groups`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data.data;
  },
};
