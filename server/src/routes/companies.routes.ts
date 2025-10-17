import { Router } from 'express';
import {
  getAllCompanies,
  getCompanyById,
  createCompany,
  updateCompany,
  toggleCompanyStatus,
  changeAdminPassword,
  togglePDCA,
  deleteCompany,
} from '../controllers/companies.controller';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../types';

const router = Router();

// All routes require authentication and MASTER role
router.use(authenticate);
router.use(authorize(UserRole.MASTER));

// Master-only routes
router.get('/', getAllCompanies);
router.post('/', createCompany);
router.get('/:id', getCompanyById);
router.put('/:id', updateCompany);
router.patch('/:id/toggle-status', toggleCompanyStatus);
router.patch('/:id/change-admin-password', changeAdminPassword);
router.patch('/:id/toggle-pdca', togglePDCA);
router.delete('/:id', deleteCompany);

export default router;
