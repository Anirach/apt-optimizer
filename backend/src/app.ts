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
