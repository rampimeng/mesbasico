import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3002', 10),
};

// Validar variáveis críticas
if (!config.databaseUrl) {
  console.error('ERROR: DATABASE_URL is not defined in .env file');
  process.exit(1);
}

if (config.jwtSecret === 'default_secret_change_in_production' && config.nodeEnv === 'production') {
  console.error('ERROR: JWT_SECRET must be set in production environment');
  process.exit(1);
}
