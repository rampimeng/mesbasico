import { sign, verify, SignOptions } from 'jsonwebtoken';
import { config } from '../config/env';
import { JWTPayload } from '../types';

export const generateToken = (payload: JWTPayload): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as any,
  };
  return sign(payload, config.jwtSecret, options);
};

export const verifyToken = (token: string): JWTPayload => {
  try {
    return verify(token, config.jwtSecret) as JWTPayload;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};
