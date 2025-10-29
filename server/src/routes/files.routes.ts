import { Router } from 'express';
import {
  uploadFile,
  getAllFiles,
  getOperatorFiles,
  deleteFile,
  updateFile,
  upload,
} from '../controllers/files.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Operator can view files linked to their groups
router.get('/operator/my-files', authorize(UserRole.OPERATOR), getOperatorFiles);

// Admin can manage all files
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllFiles);
router.post('/', authorize(UserRole.ADMIN), upload.single('file'), uploadFile);
router.put('/:id', authorize(UserRole.ADMIN), updateFile);
router.delete('/:id', authorize(UserRole.ADMIN), deleteFile);

export default router;
