import app from './app';
import { config } from './config/env';
import supabase from './config/supabase';

const startServer = async () => {
  try {
    // Testar conexão com o Supabase
    const { error } = await supabase.from('companies').select('count').limit(1).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, mas conexão OK
      console.warn('⚠️  Supabase connection warning:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }

    // Iniciar servidor HTTP
    app.listen(config.port, () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`📝 Environment: ${config.nodeEnv}`);
      console.log(`🌐 API URL: http://localhost:${config.port}/api`);
      console.log(`🏥 Health check: http://localhost:${config.port}/api/health`);
      console.log(`📊 Supabase URL: ${process.env.SUPABASE_URL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();
