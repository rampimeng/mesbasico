import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  // Prisma errors
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        return res.status(400).json({
          success: false,
          error: 'A record with this value already exists',
        });
      case 'P2025':
        return res.status(404).json({
          success: false,
          error: 'Record not found',
        });
      default:
        return res.status(400).json({
          success: false,
          error: 'Database error',
        });
    }
  }

  // Validation errors
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: error.message,
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error',
  });
};
