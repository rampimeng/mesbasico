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
import supabase from '../config/supabase';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'MES SaaS API is running',
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

export default router;
