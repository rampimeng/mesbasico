import { Router } from 'express';
import { authorize } from '../middleware/auth';
import { UserRole } from '../types';
import {
  getParetoData,
  getTimeMetrics,
  getCycleMetrics,
} from '../controllers/analytics.controller';

const router = Router();

// Analytics routes (ADMIN and SUPERVISOR only)
router.get('/pareto', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getParetoData);
router.get('/time-metrics', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getTimeMetrics);
router.get('/cycle-metrics', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getCycleMetrics);

export default router;
