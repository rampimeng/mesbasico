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
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Operator can view their own machines
router.get('/operator/my-machines', authorize(UserRole.OPERATOR), getOperatorMachines);

// Admin and Supervisor can view all
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllMachines);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getMachineById);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createMachine);
router.put('/:id', authorize(UserRole.ADMIN), updateMachine);
router.delete('/:id', authorize(UserRole.ADMIN), deleteMachine);

export default router;
