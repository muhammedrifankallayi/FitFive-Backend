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
    // Security middleware with relaxed cross-origin policy
    this.app.use(
      helmet({
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        crossOriginEmbedderPolicy: false,
      })
    );

    // CORS middleware - must be before other middlewares
    this.app.use(
      cors({
        origin: config.cors.origin,
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        exposedHeaders: ['Content-Length', 'Content-Type'],
        maxAge: 600, // Cache preflight requests for 10 minutes
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

    // Static files - serve uploaded files with CORS support
    this.app.use(
      '/uploads',
      (_req, res, next) => {
        // Set CORS headers explicitly for static files
        res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        // Disable caching to prevent 304 issues during development
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        res.setHeader('Pragma', 'no-cache');
        res.setHeader('Expires', '0');
        // Set Cross-Origin-Resource-Policy to allow cross-origin access
        res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
        next();
      },
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
