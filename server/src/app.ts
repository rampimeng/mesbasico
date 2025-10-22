import express, { Express } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { requestLogger } from './middleware/logger';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app: Express = express();

// Middlewares
app.use(cors({
  origin: config.corsOrigin,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

// Health check na raiz (para Easypanel/Docker)
app.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Health check alternativo
app.get('/', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'CORTEXON API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      apiHealth: '/api/health',
    },
  });
});

// Routes
app.use('/api', routes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
