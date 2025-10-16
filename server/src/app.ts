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

// Routes
app.use('/api', routes);

// Error handler (deve ser o último middleware)
app.use(errorHandler);

export default app;
