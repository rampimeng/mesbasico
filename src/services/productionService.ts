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
  async startSession(machineId: string, operatorId?: string) {
    console.log('🎬 Starting session for machine:', machineId, 'operatorId:', operatorId);
    const response = await fetch(`${API_URL}/production/sessions/start`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, operatorId }),
    });
    const data = await response.json();
    console.log('📦 Start session response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to start session');
    return data.data;
  },

  // End a production session
  async endSession(machineId: string, operatorId?: string) {
    console.log('🛑 Ending session for machine:', machineId, 'operatorId:', operatorId);
    const response = await fetch(`${API_URL}/production/sessions/end`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, operatorId }),
    });
    const data = await response.json();
    console.log('📦 End session response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to end session');
    return data;
  },

  // Update machine status
  async updateMachineStatus(machineId: string, status: string, stopReasonId?: string, operatorId?: string) {
    console.log('🔄 Updating machine status:', { machineId, status, stopReasonId, operatorId });
    const response = await fetch(`${API_URL}/production/machines/status`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, status, stopReasonId, operatorId }),
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
    stopReasonId?: string,
    operatorId?: string
  ) {
    console.log('🔄 Updating matrix status:', { matrixId, machineId, matrixNumber, status, stopReasonId, operatorId });
    const response = await fetch(`${API_URL}/production/matrices/status`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ matrixId, machineId, matrixNumber, status, stopReasonId, operatorId }),
    });
    const data = await response.json();
    console.log('📦 Update matrix status response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to update matrix status');
    return data;
  },

  // Record a completed cycle
  async recordCycle(machineId: string, matrixId?: string, operatorId?: string) {
    console.log('🔄 Recording cycle:', { machineId, matrixId, operatorId });
    const response = await fetch(`${API_URL}/production/cycles`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify({ machineId, matrixId, operatorId }),
    });
    const data = await response.json();
    console.log('📦 Record cycle response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to record cycle');
    return data.data;
  },

  // Get today's shift start time
  async getTodayShiftStart() {
    const response = await fetch(`${API_URL}/production/sessions/today-shift-start`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch shift start time');
    return data.data;
  },

  // Get today's shift start time for a specific operator (for monitoring)
  async getOperatorShiftStart(operatorId: string) {
    const response = await fetch(`${API_URL}/production/sessions/operator-shift-start/${operatorId}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch operator shift start time');
    return data.data;
  },

  // Get shift end reason ID (creates "Turno Encerrado" if doesn't exist)
  async getShiftEndReasonId(): Promise<string> {
    console.log('🔍 Getting shift end reason ID...');
    const response = await fetch(`${API_URL}/production/sessions/shift-end-reason`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 Shift end reason response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || 'Failed to get shift end reason');
    return data.data.shiftEndReasonId;
  },
};
