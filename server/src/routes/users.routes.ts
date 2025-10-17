import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getOperatorGroups,
} from '../controllers/users.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllUsers);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getUserById);
router.get('/:id/groups', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getOperatorGroups);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createUser);
router.put('/:id', authorize(UserRole.ADMIN), updateUser);
router.delete('/:id', authorize(UserRole.ADMIN), deleteUser);

export default router;
