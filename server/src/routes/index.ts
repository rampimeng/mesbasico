import { Router } from 'express';
import authRoutes from './auth.routes';
import companiesRoutes from './companies.routes';
import groupsRoutes from './groups.routes';
import machinesRoutes from './machines.routes';
import shiftsRoutes from './shifts.routes';
import stopReasonsRoutes from './stop-reasons.routes';
import usersRoutes from './users.routes';
import productionRoutes from './production.routes';
import analyticsRoutes from './analytics.routes';
import auditRoutes from './audit.routes';
import maintenanceRoutes from './maintenance.routes';
import controlDashboardRoutes from './control-dashboard.routes';
import migrationsRoutes from './migrations.routes';
import filesRoutes from './files.routes';
import supabase from '../config/supabase';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'CORTEXON API is running',
    timestamp: new Date().toISOString(),
  });
});

// Test Supabase connection
router.get('/test-db', async (_req, res) => {
  try {
    const { data, error, count } = await supabase
      .from('companies')
      .select('*', { count: 'exact' });

    if (error) {
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: 'Supabase connection working',
      companiesCount: count || 0,
      companies: data || [],
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Unknown error',
    });
  }
});

// Public routes (no auth required)
router.use('/control-dashboard', controlDashboardRoutes);

// Routes
router.use('/auth', authRoutes);
router.use('/companies', companiesRoutes);
router.use('/groups', groupsRoutes);
router.use('/machines', machinesRoutes);
router.use('/shifts', shiftsRoutes);
router.use('/stop-reasons', stopReasonsRoutes);
router.use('/users', usersRoutes);
router.use('/production', productionRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit', auditRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/migrations', migrationsRoutes);
router.use('/files', filesRoutes);

console.log('📁 Files routes registered at /api/files');

export default router;
