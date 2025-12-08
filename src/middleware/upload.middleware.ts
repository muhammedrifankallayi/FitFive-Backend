import multer, { FileFilterCallback } from 'multer';
import path from 'path';
import fs from 'fs';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.upload.uploadPath);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: (_req: Request, _file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req: Request, file: Express.Multer.File, cb) => {
    const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
    const ext = path.extname(file.originalname);
    const nameWithoutExt = path.basename(file.originalname, ext);
    const sanitizedName = nameWithoutExt.replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

// File filter for validation
const fileFilter = (
  _req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Check if file type is allowed
  if (config.upload.allowedFileTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file type. Allowed types: ${config.upload.allowedFileTypes.join(', ')}`
      )
    );
  }
};

// Create multer upload instance
export const upload = multer({
  storage: storage,
  limits: {
    // fileSize: config.upload.maxFileSize,
    files: config.upload.maxFiles,
  },
  fileFilter: fileFilter,
});

// Middleware for handling multiple images
export const uploadMultipleImages = upload.array('images', config.upload.maxFiles);

// Middleware for handling single image
export const uploadSingleImage = upload.single('image');

// Middleware for handling multiple fields with images
export const uploadFields = upload.fields([
  { name: 'images', maxCount: config.upload.maxFiles },
  { name: 'thumbnail', maxCount: 1 },
]);
