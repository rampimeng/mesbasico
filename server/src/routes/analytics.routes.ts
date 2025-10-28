import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getParetoData,
  getTimeMetrics,
  getCycleMetrics,
  getOEEDetailedData,
  getStopTimeByMachine,
} from '../controllers/analytics.controller';

const router = Router();

// Analytics routes (ADMIN and SUPERVISOR only)
router.get('/pareto', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getParetoData);
router.get('/time-metrics', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getTimeMetrics);
router.get('/cycle-metrics', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getCycleMetrics);
router.get('/oee-detailed', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getOEEDetailedData);
router.get('/stop-time-by-machine', authenticate, authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getStopTimeByMachine);

export default router;
