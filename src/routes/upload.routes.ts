import { Router } from 'express';
import uploadController from '../controllers/upload.controller';
import {
  uploadMultipleImages,
  uploadSingleImage,
} from '../middleware/upload.middleware';

const router = Router();

/**
 * @route   POST /api/upload/multiple
 * @desc    Upload multiple images
 * @access  Public
 */
router.post('/multiple', uploadMultipleImages, uploadController.uploadMultiple);

/**
 * @route   POST /api/upload/single
 * @desc    Upload single image
 * @access  Public
 */
router.post('/single', uploadSingleImage, uploadController.uploadSingle);

/**
 * @route   GET /api/upload/files
 * @desc    Get all uploaded files
 * @access  Public
 */
router.get('/files', uploadController.getFiles);

/**
 * @route   DELETE /api/upload/file/:filename
 * @desc    Delete a file
 * @access  Public
 */
router.delete('/file/:filename', uploadController.deleteFile);

export default router;
