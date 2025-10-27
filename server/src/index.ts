import app from './app';
import { config } from './config/env';
import supabase from './config/supabase';
import { initializeScheduler } from './utils/scheduler';

const startServer = () => {
  console.log('🔧 Starting server...');
  console.log(`📝 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Port: ${config.port}`);
  console.log(`📊 Supabase URL: ${config.supabaseUrl}`);

  // Iniciar servidor HTTP PRIMEIRO (não esperar pelo Supabase)
  const server = app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${config.port}`);
    console.log(`🌐 API URL: http://0.0.0.0:${config.port}/api`);
    console.log(`🏥 Health check: http://0.0.0.0:${config.port}/api/health`);
    console.log(`✅ Server started successfully!`);

    // Initialize automatic shift closure scheduler
    initializeScheduler();
  });

  // Testar conexão com o Supabase em background (não bloquear)
  setTimeout(async () => {
    try {
      console.log('🔌 Testing Supabase connection...');
      const { error } = await supabase.from('companies').select('count').limit(1).single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = no rows, mas conexão OK
        console.warn('⚠️  Supabase connection warning:', error.message);
        console.warn('⚠️  Error code:', error.code);
      } else {
        console.log('✅ Supabase connected successfully');
      }
    } catch (error) {
      console.error('❌ Supabase connection failed:', error);
      console.warn('⚠️  Server is running but Supabase is not connected');
    }
  }, 1000);

  server.on('error', (error: any) => {
    console.error('❌ Server error:', error);
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${config.port} is already in use`);
      process.exit(1);
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('⚠️  SIGTERM signal received: closing HTTP server gracefully...');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('⚠️  SIGINT signal received: closing HTTP server gracefully...');
    server.close(() => {
      console.log('✅ HTTP server closed');
      process.exit(0);
    });
  });
};

// Error handlers
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Start the server
startServer();
