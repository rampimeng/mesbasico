import { Response } from 'express';
import { ApiResponse } from '../types';

export const sendSuccess = <T>(res: Response, data: T, message?: string, statusCode: number = 200) => {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return res.status(statusCode).json(response);
};

export const sendError = (res: Response, error: string, statusCode: number = 400) => {
  const response: ApiResponse = {
    success: false,
    error,
  };
  return res.status(statusCode).json(response);
};

export const sendNotFound = (res: Response, message: string = 'Resource not found') => {
  return sendError(res, message, 404);
};

export const sendUnauthorized = (res: Response, message: string = 'Unauthorized') => {
  return sendError(res, message, 401);
};

export const sendForbidden = (res: Response, message: string = 'Forbidden') => {
  return sendError(res, message, 403);
};

export const sendServerError = (res: Response, message: string = 'Internal server error') => {
  return sendError(res, message, 500);
};
