import { Request, Response, NextFunction } from 'express';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Global error handling middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Default error status and message
  let status = 'error';
  let statusCode = 500;
  let message = 'Something went wrong';
  
  // If it's our custom AppError, use its status code and message
  if (err instanceof AppError) {
    status = err.status;
    statusCode = err.statusCode;
    message = err.message;
  } else if (err.name === 'ValidationError') {
    // Handle validation errors (e.g., from express-validator)
    status = 'fail';
    statusCode = 400;
    message = err.message;
  }
  
  // Determine if we should include the stack trace (not in production)
  const stack = process.env.NODE_ENV === 'production' ? undefined : err.stack;
  
  // Log error for server-side debugging
  console.error(`ERROR: ${statusCode} - ${message}`);
  if (stack) {
    console.error(stack);
  }
  
  // Send response to client
  res.status(statusCode).json({
    status,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack })
  });
}; 