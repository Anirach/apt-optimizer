import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../utils/apiResponse.js';

export function errorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.error('Error:', error);

  if (res.headersSent) {
    return next(error);
  }

  const statusCode = (error as any).statusCode || 500;
  const code = (error as any).code || 'INTERNAL_ERROR';

  res.status(statusCode).json(
    errorResponse(code, error.message, {
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    })
  );
}
