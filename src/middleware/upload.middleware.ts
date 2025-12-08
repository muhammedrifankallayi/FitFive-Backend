import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import config from '../config';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

// Configure Cloudinary storage for multer
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'fitfive',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, height: 1200, crop: 'limit' }],
  } as any,
});

// Create multer upload instance with Cloudinary storage
export const cloudinaryUpload = multer({
  storage: storage,
  limits: {
    files: config.upload.maxFiles,
  },
});

// Middleware for handling multiple images
export const uploadMultipleImages = cloudinaryUpload.array('images', config.upload.maxFiles);

// Middleware for handling single image
export const uploadSingleImage = cloudinaryUpload.single('image');

// Middleware for handling multiple fields with images
export const uploadFields = cloudinaryUpload.fields([
  { name: 'images', maxCount: config.upload.maxFiles },
  { name: 'thumbnail', maxCount: 1 },
]);

// Export cloudinary instance for direct use (e.g., deleting files)
export { cloudinary };
