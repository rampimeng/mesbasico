const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

// ============================================
// EQUIPAMENTOS
// ============================================

export interface MaintenanceEquipment {
  id: string;
  companyId: string;
  machineId?: string;
  code: string;
  name: string;
  area?: string;
  line?: string;
  sector?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  mtbf?: number;
  mttr?: number;
  responsibleId?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  machine?: { id: string; name: string; code: string };
  responsible?: { id: string; name: string; email: string };
}

export interface CreateEquipmentRequest {
  machineId?: string;
  code: string;
  name: string;
  area?: string;
  line?: string;
  sector?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  acquisitionDate?: string;
  mtbf?: number;
  mttr?: number;
  responsibleId?: string;
  status?: string;
}

// ============================================
// COMPONENTES
// ============================================

export interface MaintenanceComponent {
  id: string;
  companyId: string;
  equipmentId?: string;
  code: string;
  description: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock: number;
  unitCost: number;
  defaultSupplierId?: string;
  createdAt: string;
  updatedAt: string;
  equipment?: { id: string; name: string; code: string };
  defaultSupplier?: { id: string; corporateName: string; tradeName?: string };
}

export interface CreateComponentRequest {
  equipmentId?: string;
  code: string;
  description: string;
  unitOfMeasure: string;
  currentStock?: number;
  minimumStock?: number;
  unitCost?: number;
  defaultSupplierId?: string;
}

// ============================================
// PLANOS DE MANUTENÇÃO
// ============================================

export type MaintenanceType = 'PREVENTIVE' | 'CORRECTIVE' | 'PREDICTIVE' | 'LUBRICATION' | 'CALIBRATION';
export type MaintenanceFrequencyType = 'DAYS' | 'HOURS' | 'CYCLES' | 'COUNTER';

export interface MaintenancePlan {
  id: string;
  companyId: string;
  equipmentId: string;
  type: MaintenanceType;
  frequencyType: MaintenanceFrequencyType;
  frequencyValue: number;
  name: string;
  description?: string;
  instructions?: string;
  checklist?: any;
  responsibleId?: string;
  documents?: any;
  active: boolean;
  lastExecutionDate?: string;
  nextExecutionDate?: string;
  createdAt: string;
  updatedAt: string;
  equipment?: { id: string; name: string; code: string };
  responsible?: { id: string; name: string; email: string };
}

export interface CreateMaintenancePlanRequest {
  equipmentId: string;
  type: MaintenanceType;
  frequencyType: MaintenanceFrequencyType;
  frequencyValue: number;
  name: string;
  description?: string;
  instructions?: string;
  checklist?: any;
  responsibleId?: string;
  documents?: any;
  active?: boolean;
  lastExecutionDate?: string;
  nextExecutionDate?: string;
}

// ============================================
// ORDENS DE SERVIÇO
// ============================================

export type WorkOrderType = 'CORRECTIVE' | 'PREVENTIVE' | 'EMERGENCY' | 'INSPECTION';
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'FINISHED' | 'CANCELLED' | 'APPROVED' | 'PENDING_APPROVAL';

export interface WorkOrderMaterial {
  id: string;
  workOrderId: string;
  componentId: string;
  equipmentId?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  component?: { id: string; code: string; description: string };
}

export interface WorkOrder {
  id: string;
  companyId: string;
  equipmentId: string;
  maintenancePlanId?: string;
  workOrderNumber: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  openedDate: string;
  closedDate?: string;
  failureCause?: string;
  intervention?: string;
  executionTime?: number;
  downtime?: number;
  laborCost: number;
  materialsCost: number;
  totalCost: number;
  assignedToId?: string;
  approvedById?: string;
  approvalDate?: string;
  checklist?: any;
  signature?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  equipment?: { id: string; name: string; code: string };
  maintenancePlan?: { id: string; name: string };
  assignedTo?: { id: string; name: string; email: string };
  approvedBy?: { id: string; name: string; email: string };
  materials?: WorkOrderMaterial[];
}

export interface CreateWorkOrderRequest {
  equipmentId: string;
  maintenancePlanId?: string;
  type: WorkOrderType;
  status?: WorkOrderStatus;
  failureCause?: string;
  intervention?: string;
  executionTime?: number;
  downtime?: number;
  laborCost?: number;
  assignedToId?: string;
  checklist?: any;
  notes?: string;
}

// ============================================
// FORNECEDORES
// ============================================

export interface Supplier {
  id: string;
  companyId: string;
  corporateName: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  serviceTypes?: string[];
  sla?: number;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierRequest {
  corporateName: string;
  tradeName?: string;
  cnpj?: string;
  email?: string;
  phone?: string;
  contactPerson?: string;
  serviceTypes?: string[];
  sla?: number;
  address?: string;
  notes?: string;
  active?: boolean;
}

// ============================================
// SERVICE
// ============================================

export const maintenanceService = {
  // Equipamentos
  async getAllEquipment(): Promise<MaintenanceEquipment[]> {
    const response = await fetch(`${API_URL}/maintenance-module/equipment`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch equipment');
    return data.data;
  },

  async getEquipmentById(id: string): Promise<MaintenanceEquipment> {
    const response = await fetch(`${API_URL}/maintenance-module/equipment/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch equipment');
    return data.data;
  },

  async createEquipment(equipment: CreateEquipmentRequest): Promise<MaintenanceEquipment> {
    const response = await fetch(`${API_URL}/maintenance-module/equipment`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(equipment),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create equipment');
    return data.data;
  },

  async updateEquipment(id: string, equipment: Partial<CreateEquipmentRequest>): Promise<MaintenanceEquipment> {
    const response = await fetch(`${API_URL}/maintenance-module/equipment/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(equipment),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update equipment');
    return data.data;
  },

  async deleteEquipment(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/maintenance-module/equipment/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete equipment');
  },

  // Componentes
  async getAllComponents(): Promise<MaintenanceComponent[]> {
    const response = await fetch(`${API_URL}/maintenance-module/components`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch components');
    return data.data;
  },

  async getComponentById(id: string): Promise<MaintenanceComponent> {
    const response = await fetch(`${API_URL}/maintenance-module/components/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch component');
    return data.data;
  },

  async createComponent(component: CreateComponentRequest): Promise<MaintenanceComponent> {
    const response = await fetch(`${API_URL}/maintenance-module/components`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(component),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create component');
    return data.data;
  },

  async updateComponent(id: string, component: Partial<CreateComponentRequest>): Promise<MaintenanceComponent> {
    const response = await fetch(`${API_URL}/maintenance-module/components/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(component),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update component');
    return data.data;
  },

  async deleteComponent(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/maintenance-module/components/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete component');
  },

  // Planos de Manutenção
  async getAllMaintenancePlans(): Promise<MaintenancePlan[]> {
    const response = await fetch(`${API_URL}/maintenance-module/plans`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch maintenance plans');
    return data.data;
  },

  async getMaintenancePlanById(id: string): Promise<MaintenancePlan> {
    const response = await fetch(`${API_URL}/maintenance-module/plans/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch maintenance plan');
    return data.data;
  },

  async createMaintenancePlan(plan: CreateMaintenancePlanRequest): Promise<MaintenancePlan> {
    const response = await fetch(`${API_URL}/maintenance-module/plans`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(plan),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create maintenance plan');
    return data.data;
  },

  async updateMaintenancePlan(id: string, plan: Partial<CreateMaintenancePlanRequest>): Promise<MaintenancePlan> {
    const response = await fetch(`${API_URL}/maintenance-module/plans/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(plan),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update maintenance plan');
    return data.data;
  },

  async deleteMaintenancePlan(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/maintenance-module/plans/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete maintenance plan');
  },

  // Ordens de Serviço
  async getAllWorkOrders(filters?: { status?: WorkOrderStatus; type?: WorkOrderType; equipmentId?: string }): Promise<WorkOrder[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.type) params.append('type', filters.type);
    if (filters?.equipmentId) params.append('equipmentId', filters.equipmentId);

    const response = await fetch(`${API_URL}/maintenance-module/work-orders?${params.toString()}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch work orders');
    return data.data;
  },

  async getWorkOrderById(id: string): Promise<WorkOrder> {
    const response = await fetch(`${API_URL}/maintenance-module/work-orders/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch work order');
    return data.data;
  },

  async createWorkOrder(workOrder: CreateWorkOrderRequest): Promise<WorkOrder> {
    const response = await fetch(`${API_URL}/maintenance-module/work-orders`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(workOrder),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create work order');
    return data.data;
  },

  async updateWorkOrder(id: string, workOrder: Partial<CreateWorkOrderRequest>): Promise<WorkOrder> {
    const response = await fetch(`${API_URL}/maintenance-module/work-orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(workOrder),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update work order');
    return data.data;
  },

  async deleteWorkOrder(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/maintenance-module/work-orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete work order');
  },

  // Fornecedores
  async getAllSuppliers(): Promise<Supplier[]> {
    const response = await fetch(`${API_URL}/maintenance-module/suppliers`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch suppliers');
    return data.data;
  },

  async getSupplierById(id: string): Promise<Supplier> {
    const response = await fetch(`${API_URL}/maintenance-module/suppliers/${id}`, {
      method: 'GET',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to fetch supplier');
    return data.data;
  },

  async createSupplier(supplier: CreateSupplierRequest): Promise<Supplier> {
    const response = await fetch(`${API_URL}/maintenance-module/suppliers`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(supplier),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to create supplier');
    return data.data;
  },

  async updateSupplier(id: string, supplier: Partial<CreateSupplierRequest>): Promise<Supplier> {
    const response = await fetch(`${API_URL}/maintenance-module/suppliers/${id}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(supplier),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to update supplier');
    return data.data;
  },

  async deleteSupplier(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/maintenance-module/suppliers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete supplier');
  },
};

