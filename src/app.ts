import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import config from './config';
import routes from './routes';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware';
import { requestLogger } from './middleware/logger.middleware';

class App {
  public app: Application;

  constructor() {
    this.app = express();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    // Security middleware
    this.app.use(helmet());

    // CORS middleware
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
      })
    );

    // Compression middleware
    this.app.use(compression());

    // Body parsing middleware
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));

    // Logging middleware
    if (config.server.nodeEnv === 'development') {
      this.app.use(morgan('dev'));
    } else {
      this.app.use(morgan('combined'));
    }
    this.app.use(requestLogger);

    // Static files - serve uploaded files
    this.app.use(
      '/uploads',
      express.static(path.join(process.cwd(), 'uploads'))
    );
  }

  private initializeRoutes(): void {
    // API routes
    this.app.use('/api', routes);

    // Root route
    this.app.get('/', (_req, res) => {
      res.json({
        success: true,
        message: 'Welcome to Vestra API',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          uploadMultiple: 'POST /api/upload/multiple',
          uploadSingle: 'POST /api/upload/single',
          getFiles: 'GET /api/upload/files',
          deleteFile: 'DELETE /api/upload/file/:filename',
        },
      });
    });
  }

  private initializeErrorHandling(): void {
    // 404 handler
    this.app.use(notFoundHandler);

    // Global error handler
    this.app.use(errorHandler);
  }

  public listen(): void {
    this.app.listen(config.server.port, () => {
      console.log('=================================');
      console.log(`Environment: ${config.server.nodeEnv}`);
      console.log(`Server running on port ${config.server.port}`);
      console.log(`URL: http://${config.server.host}:${config.server.port}`);
      console.log('=================================');
    });
  }
}

export default App;
