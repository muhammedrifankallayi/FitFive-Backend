import { Request, Response, NextFunction } from 'express';
import { ApiResponse, UploadedFileInfo } from '../types';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { cloudinary } from '../middleware/upload.middleware';

// Extended file type for Cloudinary uploads
interface CloudinaryFile extends Express.Multer.File {
  path: string; // Cloudinary URL
  filename: string; // Public ID
}

class UploadController {
  /**
   * Upload multiple images
   * @route POST /api/upload/multiple
   */
  uploadMultiple = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        throw new AppError('No files uploaded', 400);
      }

      const uploadedFiles: UploadedFileInfo[] = (req.files as CloudinaryFile[]).map((file) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        destination: 'cloudinary',
        filename: file.filename, // Cloudinary public_id
        path: file.path, // Cloudinary URL
        size: file.size,
        url: file.path, // Cloudinary secure URL
      }));

      const response: ApiResponse<UploadedFileInfo[]> = {
        success: true,
        message: `Successfully uploaded ${uploadedFiles.length} file(s)`,
        data: uploadedFiles,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Upload single image
   * @route POST /api/upload/single
   */
  uploadSingle = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      if (!req.file) {
        throw new AppError('No file uploaded', 400);
      }

      const file = req.file as CloudinaryFile;

      const uploadedFile: UploadedFileInfo = {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        destination: 'cloudinary',
        filename: file.filename, // Cloudinary public_id
        path: file.path, // Cloudinary URL
        size: file.size,
        url: file.path, // Cloudinary secure URL
      };

      const response: ApiResponse<UploadedFileInfo> = {
        success: true,
        message: 'File uploaded successfully',
        data: uploadedFile,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get all uploaded files from Cloudinary
   * @route GET /api/upload/files
   */
  getFiles = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      try {
        const result = await cloudinary.api.resources({
          type: 'upload',
          prefix: 'fitfive/',
          max_results: 100,
        });

        const fileList = result.resources.map((resource: any) => ({
          filename: resource.public_id,
          size: resource.bytes,
          url: resource.secure_url,
          createdAt: resource.created_at,
          format: resource.format,
          width: resource.width,
          height: resource.height,
        }));

        const response: ApiResponse = {
          success: true,
          message: `Found ${fileList.length} file(s)`,
          data: fileList,
        };

        res.status(200).json(response);
      } catch (error) {
        const response: ApiResponse<[]> = {
          success: true,
          message: 'No files found',
          data: [],
        };
        res.status(200).json(response);
      }
    }
  );

  /**
   * Delete a file from Cloudinary
   * @route DELETE /api/upload/file/:filename
   */
  deleteFile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { filename } = req.params;

      if (!filename) {
        throw new AppError('Filename (public_id) is required', 400);
      }

      // Decode the filename in case it contains URL-encoded characters
      const publicId = decodeURIComponent(filename);

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== 'ok') {
        throw new AppError('File not found or could not be deleted', 404);
      }

      const response: ApiResponse = {
        success: true,
        message: 'File deleted successfully',
      };

      res.status(200).json(response);
    }
  );
}

export default new UploadController();
