# PAAS Platform - Implementation Guide Part 2

## Phase 2: Express Server + Authentication + Testing

### Step 2.1: Project Structure

Create this folder structure in `backend/src/`:

```
backend/src/
├── server.ts              # Main entry point
├── app.ts                 # Express app configuration
├── config/
│   └── env.ts            # Environment configuration
├── middleware/
│   ├── auth.ts           # JWT authentication middleware
│   ├── errorHandler.ts   # Error handling middleware
│   └── validation.ts     # Request validation middleware
├── routes/
│   ├── auth.routes.ts
│   ├── appointments.routes.ts
│   ├── waitlist.routes.ts
│   ├── analytics.routes.ts
│   ├── slots.routes.ts
│   ├── patients.routes.ts
│   └── providers.routes.ts
├── controllers/
│   ├── auth.controller.ts
│   ├── appointments.controller.ts
│   └── ... (one for each route)
├── services/
│   ├── auth.service.ts
│   ├── appointments.service.ts
│   └── ... (business logic)
├── utils/
│   ├── jwt.ts
│   ├── password.ts
│   └── apiResponse.ts
├── types/
│   └── index.ts          # Shared types
├── prisma/
│   └── seed.ts
└── __tests__/
    ├── unit/
    │   ├── auth.service.test.ts
    │   ├── appointments.service.test.ts
    │   └── ...
    └── integration/
        ├── auth.routes.test.ts
        ├── appointments.routes.test.ts
        └── ...
```

### Step 2.2: Create Configuration

**backend/src/config/env.ts:**
```typescript
import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8080',
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
} as const;
```

### Step 2.3: Create Utilities

**backend/src/utils/jwt.ts:**
```typescript
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwt.secret) as JwtPayload;
}
```

**backend/src/utils/password.ts:**
```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
```

**backend/src/utils/apiResponse.ts:**
```typescript
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    timestamp: new Date().toISOString(),
  };
}
```

### Step 2.4: Create Middleware

**backend/src/middleware/auth.ts:**
```typescript
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
```

**backend/src/middleware/errorHandler.ts:**
```typescript
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
```

### Step 2.5: Create Authentication Service

**backend/src/services/auth.service.ts:**
```typescript
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

const prisma = new PrismaClient();

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: 'patient' | 'staff';
}

export class AuthService {
  async login(data: LoginRequest) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(data.password, user.password);

    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      expiresIn: 7 * 24 * 60 * 60, // 7 days in seconds
    };
  }

  async register(data: RegisterRequest) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('Email already registered');
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role || 'patient',
      },
    });

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
      expiresIn: 7 * 24 * 60 * 60,
    };
  }

  async getCurrentUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        phone: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }
}
```

### Step 2.6: Create Authentication Controller

**backend/src/controllers/auth.controller.ts:**
```typescript
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
```

### Step 2.7: Create Authentication Routes

**backend/src/routes/auth.routes.ts:**
```typescript
import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();
const authController = new AuthController();

router.post('/login', (req, res, next) => authController.login(req, res, next));
router.post('/register', (req, res, next) => authController.register(req, res, next));
router.get('/me', authMiddleware, (req, res, next) => authController.me(req, res, next));
router.post('/logout', authMiddleware, (req, res) => authController.logout(req, res));

export default router;
```

### Step 2.8: Create Express App

**backend/src/app.ts:**
```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';

// Import routes
import authRoutes from './routes/auth.routes.js';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors({
    origin: config.frontendUrl,
    credentials: true,
  }));

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Health check
  app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  // Add more routes as you build them
  // app.use('/api/appointments', appointmentsRoutes);
  // app.use('/api/waitlist', waitlistRoutes);
  // etc.

  // 404 handler
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route not found',
      },
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler (must be last)
  app.use(errorHandler);

  return app;
}
```

**backend/src/server.ts:**
```typescript
import { createApp } from './app.js';
import { config } from './config/env.js';

const app = createApp();

app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
  console.log(`🔗 Frontend URL: ${config.frontendUrl}`);
});
```

### Step 2.9: Test the Server

```bash
# Start the server
npm run dev

# Test health endpoint
curl http://localhost:3001/health

# Test registration
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User",
    "phone": "+66-81-111-1111"
  }'

# Test login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

---

## Continue to Part 3 for Unit Tests and Integration Tests

Next file: `IMPLEMENTATION_GUIDE_PART3.md`
