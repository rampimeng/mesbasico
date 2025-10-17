// User Roles
export enum UserRole {
  MASTER = 'MASTER',
  ADMIN = 'ADMIN',
  SUPERVISOR = 'SUPERVISOR',
  OPERATOR = 'OPERATOR',
}

// JWT Payload
export interface JWTPayload {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

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
    role: string;
    companyId?: string;
  };
  company?: {
    id: string;
    name: string;
    logoUrl?: string;
    dashboardToken: string;
  };
}

export interface MachineStatusUpdate {
  machineId: string;
  status: string;
  stopReasonId?: string;
  operatorId: string;
}

export interface MatrixStatusUpdate {
  matrixId: string;
  status: string;
  stopReasonId?: string;
}

export interface CycleCompleteEvent {
  machineId: string;
  operatorId: string;
  timestamp: Date;
}
