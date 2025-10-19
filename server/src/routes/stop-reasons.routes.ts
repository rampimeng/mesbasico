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

// Admin, Supervisor and Operator can view (operators need to see stop reasons in modals)
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR), getAllStopReasons);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.OPERATOR), getStopReasonById);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createStopReason);
router.put('/:id', authorize(UserRole.ADMIN), updateStopReason);
router.delete('/:id', authorize(UserRole.ADMIN), deleteStopReason);

export default router;
