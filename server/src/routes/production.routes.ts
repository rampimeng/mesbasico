import { Router } from 'express';
import {
  startSession,
  endSession,
  updateMachineStatus,
  updateMatrixStatus,
  recordCycle,
  getTodayShiftStart,
  getOperatorShiftStart,
  getShiftEndReasonId,
} from '../controllers/production.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types';

const router = Router();

// All production routes require authentication
router.use(authenticate);

// Production session management
router.post('/sessions/start', checkRole([UserRole.OPERATOR]), startSession);
router.post('/sessions/end', checkRole([UserRole.OPERATOR]), endSession);
router.get('/sessions/today-shift-start', checkRole([UserRole.OPERATOR]), getTodayShiftStart);
router.get('/sessions/operator-shift-start/:operatorId', checkRole([UserRole.SUPERVISOR, UserRole.ADMIN]), getOperatorShiftStart);
router.get('/sessions/shift-end-reason', checkRole([UserRole.OPERATOR]), getShiftEndReasonId);

// Status updates
router.post('/machines/status', checkRole([UserRole.OPERATOR]), updateMachineStatus);
router.post('/matrices/status', checkRole([UserRole.OPERATOR]), updateMatrixStatus);

// Cycle recording
router.post('/cycles', checkRole([UserRole.OPERATOR]), recordCycle);

export default router;
