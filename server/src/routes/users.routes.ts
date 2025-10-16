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

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize('ADMIN', 'SUPERVISOR'), getAllUsers);
router.get('/:id', authorize('ADMIN', 'SUPERVISOR'), getUserById);
router.get('/:id/groups', authorize('ADMIN', 'SUPERVISOR'), getOperatorGroups);

// Only Admin can create, update, delete
router.post('/', authorize('ADMIN'), createUser);
router.put('/:id', authorize('ADMIN'), updateUser);
router.delete('/:id', authorize('ADMIN'), deleteUser);

export default router;
