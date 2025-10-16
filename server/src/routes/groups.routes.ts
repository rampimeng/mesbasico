import { Router } from 'express';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/groups.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize('ADMIN', 'SUPERVISOR'), getAllGroups);
router.get('/:id', authorize('ADMIN', 'SUPERVISOR'), getGroupById);

// Only Admin can create, update, delete
router.post('/', authorize('ADMIN'), createGroup);
router.put('/:id', authorize('ADMIN'), updateGroup);
router.delete('/:id', authorize('ADMIN'), deleteGroup);

export default router;
