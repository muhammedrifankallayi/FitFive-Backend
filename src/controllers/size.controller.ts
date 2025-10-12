import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse, CreateSizeDto, UpdateSizeDto, PaginatedResponse, QueryParams } from '../types';
import { SizeModel } from '../models/size.model';

class SizeController {
  /**
   * GET /api/sizes
   */
  getAllSizes = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as unknown as QueryParams;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const filter: any = {};
      if (search) filter.name = new RegExp(search, 'i');

      const total = await SizeModel.countDocuments(filter);
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
      const data = await SizeModel.find(filter)
        .sort({ [sortBy]: sortOrderNum })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .exec();

      const response: PaginatedResponse<any> = {
        success: true,
        message: `Retrieved ${data.length} sizes`,
        data,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
        },
      };

      res.status(200).json(response);
    }
  );

  getSizeById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const size = await SizeModel.findById(id).lean().exec();
      if (!size) throw new AppError('Size not found', 404);

      const response: ApiResponse<any> = { success: true, message: 'Size retrieved successfully', data: size };
      res.status(200).json(response);
    }
  );

  createSize = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const payload: CreateSizeDto = req.body;
      if (!payload.name) throw new AppError('Name is required', 400);

      // ensure unique name handled by model unique index
      const created = await SizeModel.create({ name: payload.name, code: payload.code });
      const response: ApiResponse<any> = { success: true, message: 'Size created successfully', data: created };
      res.status(201).json(response);
    }
  );

  updateSize = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const updates: UpdateSizeDto = req.body;

      const existing = await SizeModel.findById(id).exec();
      if (!existing) throw new AppError('Size not found', 404);

      // If name changed, ensure uniqueness
      if (updates.name && updates.name !== (existing as any).name) {
        const other = await SizeModel.findOne({ name: updates.name, _id: { $ne: id } }).lean().exec();
        if (other) throw new AppError('Size name already exists', 400);
      }

      const updated = await SizeModel.findByIdAndUpdate(id, updates, { new: true }).lean().exec();
      const response: ApiResponse<any> = { success: true, message: 'Size updated successfully', data: updated! };
      res.status(200).json(response);
    }
  );

  deleteSize = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const existing = await SizeModel.findById(id).exec();
      if (!existing) throw new AppError('Size not found', 404);

      await SizeModel.findByIdAndDelete(id).exec();
      const response: ApiResponse = { success: true, message: 'Size deleted successfully' };
      res.status(200).json(response);
    }
  );
}

export default new SizeController();
