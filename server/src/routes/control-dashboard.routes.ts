import { Router } from 'express';
import { getCompanyByToken, getDashboardData } from '../controllers/control-dashboard.controller';

const router = Router();

// Public routes - no authentication required (token-based access)
router.get('/company/:token', getCompanyByToken);
router.get('/data/:token', getDashboardData);

export default router;
