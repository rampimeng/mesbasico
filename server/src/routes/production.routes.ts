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
  getActiveOperators,
  getTodayActiveTime,
  getMachineActiveTime,
} from '../controllers/production.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';
import { UserRole } from '../types';

const router = Router();

// All production routes require authentication
router.use(authenticate);

// Production session management
router.post('/sessions/start', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), startSession);
router.post('/sessions/end', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), endSession);
router.get('/sessions/today-shift-start', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), getTodayShiftStart);
router.get('/sessions/today-active-time', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), getTodayActiveTime);
router.get('/sessions/operator-shift-start/:operatorId', checkRole([UserRole.SUPERVISOR, UserRole.ADMIN]), getOperatorShiftStart);
router.get('/sessions/shift-end-reason', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), getShiftEndReasonId);
router.get('/sessions/active-operators', checkRole([UserRole.SUPERVISOR, UserRole.ADMIN]), getActiveOperators);
router.get('/machines/:machineId/active-time', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), getMachineActiveTime);

// Status updates
router.post('/machines/status', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), updateMachineStatus);
router.post('/matrices/status', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), updateMatrixStatus);

// Cycle recording
router.post('/cycles', checkRole([UserRole.OPERATOR, UserRole.SUPERVISOR, UserRole.ADMIN]), recordCycle);

export default router;
