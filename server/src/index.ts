import app from './app';
import { config } from './config/env';
import prisma from './config/database';

const startServer = async () => {
  try {
    // Testar conexão com o banco de dados
    await prisma.$connect();
    console.log('✅ Database connected successfully');

    // Iniciar servidor HTTP
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: http://localhost:${config.port}/api`);
      console.log(`🏥 Health check: http://localhost:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT signal received: closing HTTP server');
  await prisma.$disconnect();
  process.exit(0);
});

startServer();
