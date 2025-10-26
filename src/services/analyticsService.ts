const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export interface ParetoDataItem {
  reasonId: string;
  reasonName: string;
  duration: number;
  percentage: number;
  cumulativePercentage: number;
}

export interface TimeMetrics {
  totalProductionTime: number;
  totalStopTime: number;
  totalTime: number;
  efficiency: number;
  stopTimeByReason: Array<{
    reasonId: string;
    reasonName: string;
    duration: number;
  }>;
}

export interface OEEDetailedData {
  summary: {
    oeePercentage: number;
    totalProductionTime: number;
    totalStopTime: number;
    totalPossibleTime: number;
    totalMachines: number;
    totalMatrices: number;
  };
  machineDetails: Array<{
    machineId: string;
    machineName: string;
    numberOfMatrices: number;
    totalTime: number;
    productionTime: number;
    stopTime: number;
    oeePercentage: number;
    matrixDetails: Array<{
      matrixNumber: number;
      productionTime: number;
      stopTime: number;
      utilizationPercentage: number;
    }>;
  }>;
  timeLogs: Array<{
    machineId: string;
    machineName: string;
    matrixId?: string;
    matrixNumber?: number;
    status: string;
    startedAt: string;
    endedAt?: string;
    durationSeconds: number;
    stopReasonName?: string;
    operatorName?: string;
  }>;
}

export interface CycleMetrics {
  completedCycles: number;
  targetCycles: number;
  percentage: number;
}

export interface AnalyticsFilters {
  startDate?: string;
  endDate?: string;
  groupIds?: string[];
  machineIds?: string[];
  operatorIds?: string[];
}

export const analyticsService = {
  async getParetoData(filters: AnalyticsFilters): Promise<ParetoDataItem[]> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupIds?.length) params.append('groupIds', filters.groupIds.join(','));
    if (filters.machineIds?.length) params.append('machineIds', filters.machineIds.join(','));
    if (filters.operatorIds?.length) params.append('operatorIds', filters.operatorIds.join(','));

    console.log('📊 Fetching Pareto data with filters:', filters);
    const response = await fetch(`${API_URL}/analytics/pareto?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 Pareto response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || data.message || 'Failed to fetch Pareto data');
    return data.data;
  },

  async getTimeMetrics(filters: AnalyticsFilters): Promise<TimeMetrics> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupIds?.length) params.append('groupIds', filters.groupIds.join(','));
    if (filters.machineIds?.length) params.append('machineIds', filters.machineIds.join(','));
    if (filters.operatorIds?.length) params.append('operatorIds', filters.operatorIds.join(','));

    console.log('⏱️ Fetching time metrics with filters:', filters);
    const response = await fetch(`${API_URL}/analytics/time-metrics?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 Time metrics response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || data.message || 'Failed to fetch time metrics');
    return data.data;
  },

  async getCycleMetrics(filters: AnalyticsFilters): Promise<CycleMetrics> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupIds?.length) params.append('groupIds', filters.groupIds.join(','));
    if (filters.machineIds?.length) params.append('machineIds', filters.machineIds.join(','));
    if (filters.operatorIds?.length) params.append('operatorIds', filters.operatorIds.join(','));

    console.log('🔄 Fetching cycle metrics with filters:', filters);
    const response = await fetch(`${API_URL}/analytics/cycle-metrics?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 Cycle metrics response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || data.message || 'Failed to fetch cycle metrics');
    return data.data;
  },

  async getOEEDetailedData(filters: AnalyticsFilters): Promise<OEEDetailedData> {
    const params = new URLSearchParams();
    if (filters.startDate) params.append('startDate', filters.startDate);
    if (filters.endDate) params.append('endDate', filters.endDate);
    if (filters.groupIds?.length) params.append('groupIds', filters.groupIds.join(','));
    if (filters.machineIds?.length) params.append('machineIds', filters.machineIds.join(','));
    if (filters.operatorIds?.length) params.append('operatorIds', filters.operatorIds.join(','));

    console.log('📊 Fetching OEE detailed data with filters:', filters);
    const response = await fetch(`${API_URL}/analytics/oee-detailed?${params.toString()}`, {
      headers: getAuthHeader(),
    });
    const data = await response.json();
    console.log('📦 OEE detailed response:', { ok: response.ok, status: response.status, data });
    if (!response.ok) throw new Error(data.error || data.message || 'Failed to fetch OEE detailed data');
    return data.data;
  },
};
