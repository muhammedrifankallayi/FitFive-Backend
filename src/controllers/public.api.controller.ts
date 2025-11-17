import { asyncHandler } from '../middleware/error.middleware';
import { InventoryModel, IInventory } from '../models/inventory.model';
import { ICategory } from '../models/category.model';
import CategoryModel from '../models/category.model';

import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';






class PublicApiController {

getAvailableItems = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
        const items = (await InventoryModel.find({ isActive: true }).populate('item')).filter(inv=> inv.stock > 0);
        const response: ApiResponse<IInventory[]> = {
            success: true,
            message: `Found ${items.length} available items`,
            data: items as any,
        };
        res.status(200).json(response);
    }
);


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
