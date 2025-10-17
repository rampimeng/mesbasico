import { Router } from 'express';
import {
  getAllStopReasons,
  getStopReasonById,
  createStopReason,
  updateStopReason,
  deleteStopReason,
} from '../controllers/stop-reasons.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllStopReasons);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getStopReasonById);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createStopReason);
router.put('/:id', authorize(UserRole.ADMIN), updateStopReason);
router.delete('/:id', authorize(UserRole.ADMIN), deleteStopReason);

export default router;
