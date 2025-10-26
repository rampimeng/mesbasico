import { Router } from 'express';
import { closeHistoricalLogs, getOpenLogsStats } from '../controllers/maintenance.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types';

const router = Router();

// All maintenance routes require authentication and Admin role
router.use(authenticate);
router.use(checkRole([UserRole.ADMIN]));

// Maintenance operations
router.post('/close-historical-logs', closeHistoricalLogs);
router.get('/open-logs-stats', getOpenLogsStats);

export default router;
