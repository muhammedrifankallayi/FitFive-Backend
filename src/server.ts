import App from './app';
import { connectDatabase } from './config/database';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  console.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  console.error(error.name, error.message);
  process.exit(1);
});

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();
    
    // Start Express server
    const app = new App();
    app.listen();

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (error: Error) => {
      console.error('UNHANDLED REJECTION! 💥 Shutting down...');
      console.error(error.name, error.message);
      process.exit(1);
    });

    // Handle SIGTERM
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM RECEIVED. Shutting down gracefully');
      process.exit(0);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();


