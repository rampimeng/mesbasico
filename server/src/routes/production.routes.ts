import { Router } from 'express';
import {
  startSession,
  endSession,
  updateMachineStatus,
  updateMatrixStatus,
  recordCycle,
} from '../controllers/production.controller';
import { authenticate } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = Router();

// All production routes require authentication
router.use(authenticate);

// Production session management
router.post('/sessions/start', checkRole(['OPERATOR']), startSession);
router.post('/sessions/end', checkRole(['OPERATOR']), endSession);

// Status updates
router.post('/machines/status', checkRole(['OPERATOR']), updateMachineStatus);
router.post('/matrices/status', checkRole(['OPERATOR']), updateMatrixStatus);

// Cycle recording
router.post('/cycles', checkRole(['OPERATOR']), recordCycle);

export default router;
