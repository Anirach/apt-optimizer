import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login(req.body);
      res.json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register(req.body);
      res.status(201).json(successResponse(result));
    } catch (error) {
      next(error);
    }
  }

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        return res.status(401).json(
          errorResponse('UNAUTHORIZED', 'Not authenticated')
        );
      }

      const user = await authService.getCurrentUser(req.user.userId);
      res.json(successResponse(user));
    } catch (error) {
      next(error);
    }
  }

  async logout(req: Request, res: Response) {
    // With JWT, logout is handled client-side by removing the token
    res.json(successResponse({ message: 'Logged out successfully' }));
  }
}
