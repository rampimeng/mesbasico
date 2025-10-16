import { Router } from 'express';
import { AuthSupabaseController } from '../controllers/auth.supabase.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const authController = new AuthSupabaseController();

// Public routes
router.post('/login', (req, res) => authController.login(req, res));

// Protected routes
router.post('/logout', authenticate, (req, res) => authController.logout(req, res));
router.get('/me', authenticate, (req, res) => authController.me(req, res));

export default router;
