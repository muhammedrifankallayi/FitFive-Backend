import { Request, Response, NextFunction } from 'express';
import { ErrorResponse } from '../types';

// Custom error class
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handler middleware
export const errorHandler = (
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  let statusCode = 500;
  let message = 'Internal Server Error';
  let error = err.message;

  // Handle specific error types
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'MulterError') {
    statusCode = 400;
    message = 'File Upload Error';
    
    // Specific multer error messages
    if (err.message.includes('File too large')) {
      error = 'File size exceeds the maximum allowed limit';
    } else if (err.message.includes('Too many files')) {
      error = 'Too many files uploaded';
    } else if (err.message.includes('Unexpected field')) {
      error = 'Unexpected field in form data';
    } else {
      error = err.message;
    }
  } else if (err.message.includes('Invalid file type')) {
    statusCode = 400;
    message = 'Invalid File Type';
    error = err.message;
  }

  const response: ErrorResponse = {
    success: false,
    message,
    error,
    statusCode,
  };

  // Log error in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  res.status(statusCode).json(response);
};

// 404 handler
export const notFoundHandler = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const error = new AppError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

// Async handler wrapper
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
