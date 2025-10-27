import { Router } from 'express';
import { createMissingMatrices } from '../controllers/migrations.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Migration endpoint - Admin only
router.post('/matrices/create-missing', checkRole([UserRole.ADMIN]), createMissingMatrices);

export default router;
