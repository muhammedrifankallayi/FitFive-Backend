import dotenv from 'dotenv';

dotenv.config();

interface Config {
  server: {
    nodeEnv: string;
    port: number;
    host: string;
  };
  database: {
    mongoUri: string;
  };
  jwt: {
    secret: string;
    expire: string;
  };
  upload: {
    maxFileSize: number;
    maxFiles: number;
    allowedFileTypes: string[];
    uploadPath: string;
  };
  cors: {
    origin: string | string[];
  };
  rateLimit: {
    windowMs: number;
    maxRequests: number;
  };
}

const config: Config = {
  server: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    host: process.env.HOST || 'localhost',
  },
  database: {
    mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/vestra',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'fallback-secret-key',
    expire: process.env.JWT_EXPIRE || '7d',
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB default
    maxFiles: parseInt(process.env.MAX_FILES || '10', 10),
    allowedFileTypes: process.env.ALLOWED_FILE_TYPES
      ? process.env.ALLOWED_FILE_TYPES.split(',')
      : ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'],
    uploadPath: 'uploads/',
  },
  cors: {
    origin: process.env.CORS_ORIGIN === '*' 
      ? '*' 
      : process.env.CORS_ORIGIN?.split(',') || '*',
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10),
  },
};

export default config;
