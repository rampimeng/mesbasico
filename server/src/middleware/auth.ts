import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { sendUnauthorized } from '../utils/response';
import { UserRole } from '../types';

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendUnauthorized(res, 'No token provided');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return sendUnauthorized(res, 'Invalid or expired token');
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendUnauthorized(res, 'Authentication required');
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
      });
    }

    next();
  };
};

// Middleware para garantir segregação de dados por empresa
export const ensureCompanyAccess = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return sendUnauthorized(res, 'Authentication required');
  }

  // Master pode acessar qualquer empresa
  if (req.user.role === UserRole.MASTER) {
    return next();
  }

  // Outros usuários só podem acessar sua própria empresa
  const companyId = req.params.companyId || req.body.companyId || req.query.companyId;

  if (companyId && companyId !== req.user.companyId) {
    return res.status(403).json({
      success: false,
      error: 'Access denied to this company',
    });
  }

  next();
};
