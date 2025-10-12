import { Request, Response, NextFunction } from 'express';
// ...existing code...
import { asyncHandler, AppError } from '../middleware/error.middleware';
import {
  ApiResponse,
  CreateCategoryDto,
  UpdateCategoryDto,
  PaginatedResponse,
  QueryParams,
} from '../types';

import CategoryModel from '../models/category.model';
import ItemModel, { IItem } from '../models/item.model';


class CategoryController {
  /**
   * Get all categories with optional filtering and pagination
   * @route GET /api/categories
   */
  getAllCategories = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as unknown as QueryParams;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      // Build Mongo filter
      const filter: any = {};
      if (search) {
        const re = new RegExp(search, 'i');
        filter.$or = [
          { name: re },
          { description: re },
          { slug: re },
        ];
      }
      if (isActive !== undefined) {
        filter.isActive = isActive;
      }

      const total = await CategoryModel.countDocuments(filter);
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
      const data = await CategoryModel.find(filter)
        .sort({ [sortBy]: sortOrderNum })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .exec();

      const response: PaginatedResponse<any> = {
        success: true,
        message: `Retrieved ${data.length} categories`,
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

  /**
   * Get category by ID
   * @route GET /api/categories/:id
   */
  getCategoryById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const category = await CategoryModel.findById(id).lean().exec();
      if (!category) throw new AppError('Category not found', 404);

      const response: ApiResponse<any> = {
        success: true,
        message: 'Category retrieved successfully',
        data: category,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Create new category
   * @route POST /api/categories
   */
  createCategory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const categoryData: CreateCategoryDto = req.body;

      // Validate required fields
      if (!categoryData.name || !categoryData.description) {
        throw new AppError('Name and description are required', 400);
      }

      // Generate slug if not provided
      const slug =
        categoryData.slug ||
        categoryData.name
          .toLowerCase()
          .replace(/\s+/g, '-')
          .replace(/[^\w-]/g, '');

      // Check parent category in DB if provided
      if (categoryData.parentId) {
        const parent = await CategoryModel.findById(categoryData.parentId).exec();
        if (!parent) throw new AppError('Parent category not found', 404);
      }

      // Ensure slug uniqueness
      const existing = await CategoryModel.findOne({ slug }).lean().exec();
      if (existing) throw new AppError('Category slug already exists', 400);

      const createdCategory = await CategoryModel.create({
        name: categoryData.name,
        description: categoryData.description,
        slug,
        images: categoryData.images || [],
        parentId: categoryData.parentId || null,
        isActive: categoryData.isActive !== undefined ? categoryData.isActive : true,
      });

      const response: ApiResponse<any> = {
        success: true,
        message: 'Category created successfully',
        data: createdCategory,
      };

      res.status(201).json(response);
    }
  );

  /**
   * Update category
   * @route PUT /api/categories/:id
   */
  updateCategory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const updates: UpdateCategoryDto = req.body;
      // Check if category exists
      const existingCategory = await CategoryModel.findById(id).exec();
      if (!existingCategory) throw new AppError('Category not found', 404);

      // Check parent category logic
      if (updates.parentId) {
        if (updates.parentId === id) throw new AppError('Category cannot be its own parent', 400);
        const parent = await CategoryModel.findById(updates.parentId).exec();
        if (!parent) throw new AppError('Parent category not found', 404);
      }

      // If slug is being updated, ensure uniqueness
      if (updates.slug) {
        const other = await CategoryModel.findOne({ slug: updates.slug, _id: { $ne: id } }).lean().exec();
        if (other) throw new AppError('Category slug already in use', 400);
      }

      const updated = await CategoryModel.findByIdAndUpdate(id, updates, { new: true }).lean().exec();

      const response: ApiResponse<any> = {
        success: true,
        message: 'Category updated successfully',
        data: updated,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete category
   * @route DELETE /api/categories/:id
   */
  deleteCategory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const existing = await CategoryModel.findById(id).exec();
      if (!existing) throw new AppError('Category not found', 404);



      await CategoryModel.findByIdAndDelete(id).exec();

      const response: ApiResponse = { success: true, message: 'Category deleted successfully' };
      res.status(200).json(response);
    }
  );

  /**
   * Get category with items
   * @route GET /api/categories/:id/items
   */
  getCategoryWithItems = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const category = await CategoryModel.findById(id).lean().exec();
      if (!category) throw new AppError('Category not found', 404);
  
      const items = await ItemModel.find({ categoryId: id });
      const response: ApiResponse<IItem[]> = {
        success: true,
        message: 'Category and items retrieved successfully',
        data: items,
      };

      res.status(200).json(response);
    }
  );
}

export default new CategoryController();
