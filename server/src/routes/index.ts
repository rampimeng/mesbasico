import { Router } from 'express';
import authRoutes from './auth.routes';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'MES SaaS API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
router.use('/auth', authRoutes);
// TODO: Adicionar mais rotas (companies, users, machines, etc.)

export default router;
