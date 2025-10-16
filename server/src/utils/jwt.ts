import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { UserRole } from '@prisma/client';

export interface JwtPayload {
  id: string;
  email: string;
  role: UserRole;
  companyId?: string;
}

export const generateToken = (payload: JwtPayload): string => {
  return jwt.sign(payload, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const verifyToken = (token: string): JwtPayload => {
  try {
    return jwt.verify(token, config.jwtSecret) as JwtPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
