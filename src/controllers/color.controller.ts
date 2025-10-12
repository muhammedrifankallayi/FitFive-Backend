import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse, CreateColorDto, UpdateColorDto, PaginatedResponse, QueryParams } from '../types';
import { ColorModel } from '../models/color.model';

class ColorController {
  getAllColors = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { page = 1, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query as unknown as QueryParams;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const filter: any = {};
      if (search) filter.name = new RegExp(search, 'i');

      const total = await ColorModel.countDocuments(filter);
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
      const data = await ColorModel.find(filter)
        .sort({ [sortBy]: sortOrderNum })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .exec();

      const response: PaginatedResponse<any> = {
        success: true,
        message: `Retrieved ${data.length} colors`,
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

  getColorById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const color = await ColorModel.findById(id).lean().exec();
      if (!color) throw new AppError('Color not found', 404);

      const response: ApiResponse<any> = { success: true, message: 'Color retrieved successfully', data: color };
      res.status(200).json(response);
    }
  );

  createColor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const payload: CreateColorDto = req.body;
      if (!payload.name) throw new AppError('Name is required', 400);

      const created = await ColorModel.create({ name: payload.name, hex: payload.hex, rgb: payload.rgb });
      const response: ApiResponse<any> = { success: true, message: 'Color created successfully', data: created };
      res.status(201).json(response);
    }
  );

  updateColor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const updates: UpdateColorDto = req.body;

      const existing = await ColorModel.findById(id).exec();
      if (!existing) throw new AppError('Color not found', 404);

      if (updates.name && updates.name !== (existing as any).name) {
        const other = await ColorModel.findOne({ name: updates.name, _id: { $ne: id } }).lean().exec();
        if (other) throw new AppError('Color name already exists', 400);
      }

      const updated = await ColorModel.findByIdAndUpdate(id, updates, { new: true }).lean().exec();
      const response: ApiResponse<any> = { success: true, message: 'Color updated successfully', data: updated! };
      res.status(200).json(response);
    }
  );

  deleteColor = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const existing = await ColorModel.findById(id).exec();
      if (!existing) throw new AppError('Color not found', 404);

      await ColorModel.findByIdAndDelete(id).exec();
      const response: ApiResponse = { success: true, message: 'Color deleted successfully' };
      res.status(200).json(response);
    }
  );
}

export default new ColorController();
