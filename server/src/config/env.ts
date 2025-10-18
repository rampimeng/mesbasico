import * as dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  supabaseUrl: process.env.SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  jwtSecret: process.env.JWT_SECRET || 'default_secret_change_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  websocketPort: parseInt(process.env.WEBSOCKET_PORT || '3002', 10),
};

// Validar variáveis críticas do Supabase
if (!config.supabaseUrl) {
  console.error('ERROR: SUPABASE_URL is not defined in environment variables');
  process.exit(1);
}

if (!config.supabaseServiceRoleKey) {
  console.error('ERROR: SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables');
  process.exit(1);
}

if (config.jwtSecret === 'default_secret_change_in_production' && config.nodeEnv === 'production') {
  console.error('ERROR: JWT_SECRET must be set in production environment');
  process.exit(1);
}
