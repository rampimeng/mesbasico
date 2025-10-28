import { Router } from 'express';
import {
  getAllGroups,
  getGroupById,
  createGroup,
  updateGroup,
  deleteGroup,
  getGroupStopReasons,
  updateGroupStopReasons,
} from '../controllers/groups.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Admin and Supervisor can view
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllGroups);
router.get('/:id', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getGroupById);
router.get('/:id/stop-reasons', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getGroupStopReasons);

// Only Admin can create, update, delete
router.post('/', authorize(UserRole.ADMIN), createGroup);
router.put('/:id', authorize(UserRole.ADMIN), updateGroup);
router.put('/:id/stop-reasons', authorize(UserRole.ADMIN), updateGroupStopReasons);
router.delete('/:id', authorize(UserRole.ADMIN), deleteGroup);

export default router;
