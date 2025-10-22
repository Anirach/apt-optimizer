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
