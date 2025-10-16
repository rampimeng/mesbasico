import { Router } from 'express';
import {
  getAllMachines,
  getMachineById,
  getOperatorMachines,
  createMachine,
  updateMachine,
  deleteMachine,
} from '../controllers/machines.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Operator can view their own machines
router.get('/operator/my-machines', authorize('OPERATOR'), getOperatorMachines);

// Admin and Supervisor can view all
router.get('/', authorize('ADMIN', 'SUPERVISOR'), getAllMachines);
router.get('/:id', authorize('ADMIN', 'SUPERVISOR'), getMachineById);

// Only Admin can create, update, delete
router.post('/', authorize('ADMIN'), createMachine);
router.put('/:id', authorize('ADMIN'), updateMachine);
router.delete('/:id', authorize('ADMIN'), deleteMachine);

export default router;
