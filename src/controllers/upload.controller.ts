import { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { ApiResponse, UploadedFileInfo } from '../types';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import config from '../config';

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

      const uploadedFiles: UploadedFileInfo[] = req.files.map((file: Express.Multer.File) => ({
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        destination: file.destination,
        filename: file.filename,
        path: file.path,
        size: file.size,
        url: `/uploads/${file.filename}`,
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

      const uploadedFile: UploadedFileInfo = {
        fieldname: req.file.fieldname,
        originalname: req.file.originalname,
        encoding: req.file.encoding,
        mimetype: req.file.mimetype,
        destination: req.file.destination,
        filename: req.file.filename,
        path: req.file.path,
        size: req.file.size,
        url: `/uploads/${req.file.filename}`,
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
   * Get all uploaded files
   * @route GET /api/upload/files
   */
  getFiles = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const uploadDir = path.join(process.cwd(), config.upload.uploadPath);

      if (!fs.existsSync(uploadDir)) {
        const response: ApiResponse<[]> = {
          success: true,
          message: 'No files found',
          data: [],
        };
        res.status(200).json(response);
        return;
      }

      const files = fs.readdirSync(uploadDir);
      const fileList = files
        .filter((file: string) => file !== '.gitkeep')
        .map((file: string) => {
          const filePath = path.join(uploadDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            url: `/uploads/${file}`,
            createdAt: stats.birthtime,
          };
        });

      const response: ApiResponse = {
        success: true,
        message: `Found ${fileList.length} file(s)`,
        data: fileList,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete a file
   * @route DELETE /api/upload/file/:filename
   */
  deleteFile = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { filename } = req.params;

      if (!filename) {
        throw new AppError('Filename is required', 400);
      }

      const filePath = path.join(
        process.cwd(),
        config.upload.uploadPath,
        filename
      );

      if (!fs.existsSync(filePath)) {
        throw new AppError('File not found', 404);
      }

      fs.unlinkSync(filePath);

      const response: ApiResponse = {
        success: true,
        message: 'File deleted successfully',
      };

      res.status(200).json(response);
    }
  );
}

export default new UploadController();
