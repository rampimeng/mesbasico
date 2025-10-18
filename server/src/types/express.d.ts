import { UserRole } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
        companyId?: string;
      };
    }
  }
}

export {};
