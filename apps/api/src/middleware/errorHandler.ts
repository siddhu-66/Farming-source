import { Request, Response, NextFunction } from 'express';
import { logger } from '../config/logger';
import { BaseError, NotFoundError } from '../utils/errors';
import { formatError } from '../utils/formatResponse';

// Keep ApiError for backward compatibility until all files are refactored
export class ApiError extends BaseError {
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super('ApiError', statusCode, message);
    this.isOperational = isOperational;
  }
}

export const createApiError = (statusCode: number, message: string): ApiError => {
  return new ApiError(statusCode, message);
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  next(new NotFoundError(`Route ${req.originalUrl} not found`));
};

export const errorHandler = (
  err: Error | BaseError | ApiError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let code = 'SERVER_ERROR';
  let errors: any[] = [];

  if (err instanceof BaseError) {
    statusCode = err.statusCode;
    message = err.message;
    errors = err.errors;
    code = `AUTH_${statusCode}`; // Follow blueprint example structure
  } else if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Validation failed';
    errors = [(err as any).message];
    code = 'AUTH_422';
  } else if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    code = 'AUTH_400';
  } else if ((err as any).code === '23505') { // Supabase/Postgres unique violation
    statusCode = 409;
    message = 'Resource already exists';
    errors = [(err as any).details || (err as any).message];
    code = 'AUTH_409';
  } else {
    // Log unexpected errors
    logger.error(`[UNHANDLED ERROR] ${err.name}: ${err.message}\n${err.stack}`);
  }

  // Hide internal server error details in production
  if (statusCode >= 500 && process.env.NODE_ENV === 'production') {
    message = 'Internal Server Error';
  }

  // We map back to the blueprint's { success: false, message: string, code: string, timestamp: string }
  res.status(statusCode).json({
    success: false,
    message,
    errors: errors.length ? errors : undefined,
    code,
    timestamp: new Date().toISOString()
  });
};
