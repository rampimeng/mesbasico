import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
  error: Error & { code?: string },
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error('Error:', error);

  // Database errors (Supabase/PostgreSQL)
  if (error.code) {
    switch (error.code) {
      case '23505': // Unique violation
        return res.status(400).json({
          success: false,
          error: 'A record with this value already exists',
        });
      case '23503': // Foreign key violation
        return res.status(400).json({
          success: false,
          error: 'Related record not found',
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
