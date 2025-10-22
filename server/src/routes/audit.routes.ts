import { Router } from 'express';
import {
  getCycleLogs,
  getTimeLogs,
  deleteCycleLog,
  deleteTimeLog,
} from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view audit logs
router.get('/cycles', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getCycleLogs);
router.get('/time-logs', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getTimeLogs);

// Only Admin can delete logs
router.delete('/cycles/:id', authorize(UserRole.ADMIN), deleteCycleLog);
router.delete('/time-logs/:id', authorize(UserRole.ADMIN), deleteTimeLog);

export default router;
