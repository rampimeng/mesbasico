import app from './app';
import { config } from './config/env';
import supabase from './config/supabase';

const startServer = async () => {
  try {
    console.log('🔧 Starting server...');
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`🌐 Port: ${config.port}`);
    console.log(`📊 Supabase URL: ${config.supabaseUrl}`);

    // Testar conexão com o Supabase
    console.log('🔌 Testing Supabase connection...');
    const { error } = await supabase.from('companies').select('count').limit(1).single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = no rows, mas conexão OK
      console.warn('⚠️  Supabase connection warning:', error.message);
      console.warn('⚠️  Error code:', error.code);
    } else {
      console.log('✅ Supabase connected successfully');
    }

    // Iniciar servidor HTTP
    app.listen(config.port, '0.0.0.0', () => {
      console.log(`🚀 Server is running on port ${config.port}`);
      console.log(`🌐 API URL: http://0.0.0.0:${config.port}/api`);
      console.log(`🏥 Health check: http://0.0.0.0:${config.port}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('❌ Error details:', JSON.stringify(error, null, 2));
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
