import { Router } from 'express';
import {
  getAllStopReasons,
  getStopReasonById,
  createStopReason,
  updateStopReason,
  deleteStopReason,
} from '../controllers/stop-reasons.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize('ADMIN', 'SUPERVISOR'), getAllStopReasons);
router.get('/:id', authorize('ADMIN', 'SUPERVISOR'), getStopReasonById);

// Only Admin can create, update, delete
router.post('/', authorize('ADMIN'), createStopReason);
router.put('/:id', authorize('ADMIN'), updateStopReason);
router.delete('/:id', authorize('ADMIN'), deleteStopReason);

export default router;
