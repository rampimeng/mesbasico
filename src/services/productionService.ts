const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const productionService = {
  // Start a production session
  async startSession(machineId: string) {
    console.log('🎬 Starting session for machine:', machineId);
    const response = await fetch(`${API_URL}/production/sessions/start`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId }),
    });
    const data = await response.json();
    console.log('📦 Start session response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to start session');
    return data.data;
  },

  // End a production session
  async endSession(machineId: string) {
    console.log('🛑 Ending session for machine:', machineId);
    const response = await fetch(`${API_URL}/production/sessions/end`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId }),
    });
    const data = await response.json();
    console.log('📦 End session response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to end session');
    return data;
  },

  // Update machine status
  async updateMachineStatus(machineId: string, status: string, stopReasonId?: string) {
    console.log('🔄 Updating machine status:', { machineId, status, stopReasonId });
    const response = await fetch(`${API_URL}/production/machines/status`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, status, stopReasonId }),
    });
    const data = await response.json();
    console.log('📦 Update machine status response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to update machine status');
    return data;
  },

  // Update matrix status
  async updateMatrixStatus(
    matrixId: string,
    machineId: string,
    matrixNumber: number,
    status: string,
    stopReasonId?: string
  ) {
    console.log('🔄 Updating matrix status:', { matrixId, machineId, matrixNumber, status, stopReasonId });
    const response = await fetch(`${API_URL}/production/matrices/status`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ matrixId, machineId, matrixNumber, status, stopReasonId }),
    });
    const data = await response.json();
    console.log('📦 Update matrix status response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to update matrix status');
    return data;
  },

  // Record a completed cycle
  async recordCycle(machineId: string, matrixId?: string) {
    console.log('🔄 Recording cycle:', { machineId, matrixId });
    const response = await fetch(`${API_URL}/production/cycles`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, matrixId }),
    });
    const data = await response.json();
    console.log('📦 Record cycle response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to record cycle');
    return data.data;
  },
};
