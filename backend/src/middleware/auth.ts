import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../utils/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'No token provided')
      );
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);

    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json(
      errorResponse('INVALID_TOKEN', 'Invalid or expired token')
    );
  }
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json(
        errorResponse('UNAUTHORIZED', 'Authentication required')
      );
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(
        errorResponse('FORBIDDEN', 'Insufficient permissions')
      );
    }

    next();
  };
}
