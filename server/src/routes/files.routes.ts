import { Router } from 'express';
import {
  uploadFile,
  getAllFiles,
  getOperatorFiles,
  deleteFile,
  updateFile,
  upload,
  serveFile,
} from '../controllers/files.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Serve file with inline headers (accessible to all authenticated users)
router.get('/view/:filename', (req, res, next) => {
  console.log('🎯 /view/:filename route hit with filename:', req.params.filename);
  console.log('🔐 Auth user:', req.user ? 'authenticated' : 'not authenticated');
  next();
}, serveFile);

// Operator can view files linked to their groups
router.get('/operator/my-files', authorize(UserRole.OPERATOR), getOperatorFiles);

// Admin can manage all files
router.get('/', authorize(UserRole.ADMIN, UserRole.SUPERVISOR), getAllFiles);
router.post('/', authorize(UserRole.ADMIN), upload.single('file'), uploadFile);
router.put('/:id', authorize(UserRole.ADMIN), updateFile);
router.delete('/:id', authorize(UserRole.ADMIN), deleteFile);

export default router;
