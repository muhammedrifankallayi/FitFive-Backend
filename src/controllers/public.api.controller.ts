import { asyncHandler } from '../middleware/error.middleware';
import { ICategory } from '../models/category.model';
import CategoryModel from '../models/category.model';
import ItemModel, { IItem } from '../models/item.model';

import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';


class PublicApiController {

    /**
     * Get all active items (products)
     * @route GET /api/public/items
     */
    getAvailableItems = asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const items = await ItemModel.find({ isActive: true })
                .populate('categoryId', 'name slug')
                .populate('sizes', 'name code')
                .populate('colors', 'name hex rgb')
                .lean();

            const response: ApiResponse<IItem[]> = {
                success: true,
                message: `Found ${items.length} available items`,
                data: items as any,
            };
            res.status(200).json(response);
        }
    );

    /**
     * Get item by ID with full details
     * @route GET /api/public/items/:itemId
     */
    getItemById = asyncHandler(
        async (req: Request, res: Response, _next: NextFunction) => {
            const { itemId } = req.params;
            const item = await ItemModel.findById(itemId)
                .populate('categoryId', 'name slug')
                .populate('sizes', 'name code')
                .populate('colors', 'name hex rgb')
                .lean();

            if (!item) {
                res.status(404).json({
                    success: false,
                    message: 'Item not found',
                    data: null,
                });
                return;
            }

            const response: ApiResponse<IItem> = {
                success: true,
                message: 'Item retrieved successfully',
                data: item as any,
            };
            res.status(200).json(response);
        }
    );

    /**
     * Get all active categories
     * @route GET /api/public/categories
     */
    getAllCategories = asyncHandler(
        async (_req: Request, res: Response, _next: NextFunction) => {
            const categories = await CategoryModel.find({ isActive: true });
            const response: ApiResponse<ICategory[]> = {
                success: true,
                message: `Found ${categories.length} categories`,
                data: categories as any,
            };
            res.status(200).json(response);
        }
    );
}

export default new PublicApiController();
