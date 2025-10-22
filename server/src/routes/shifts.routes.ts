import { Router } from 'express';
import {
  getAllShifts,
  getShiftById,
  createShift,
  updateShift,
  deleteShift,
} from '../controllers/shifts.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllShifts);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getShiftById);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createShift);
router.put('/:id', authorize(UserRole.ADMIN), updateShift);
router.delete('/:id', authorize(UserRole.ADMIN), deleteShift);

export default router;
