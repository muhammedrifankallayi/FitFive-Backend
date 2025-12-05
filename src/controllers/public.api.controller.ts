import { asyncHandler } from '../middleware/error.middleware';
import { InventoryModel } from '../models/inventory.model';
import { ICategory } from '../models/category.model';
import CategoryModel from '../models/category.model';

import { NextFunction, Request, Response } from 'express';
import { ApiResponse } from '../types';
import { IItem } from 'models/item.model';






class PublicApiController {

getAvailableItems = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
        const inentories = (await InventoryModel.find({ isActive: true, stock: { $gt: 0 } })
  .populate('item')
  .lean());
        const items:any[]   = [];
        const set = new Set<string>();

        for (const inv of inentories) {
            const itemId = inv.item._id.toString();
            if (!set.has(itemId)) {
                set.add(itemId);
                items.push(inv.item);
            }
        }

        const response: ApiResponse<IItem[]> = {
            success: true,
            message: `Found ${inentories.length} available items`,
            data: items as any,
        };
        res.status(200).json(response);
    }
);

getVariantsByItemId = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
        const { itemId } = req.params;
        const inentories = await InventoryModel.find({ item: itemId, isActive: true }).populate('item').populate('size').populate('color');
        const response: ApiResponse<IItem[]> = {
            success: true,
            message: `Found ${inentories.length} variants for item ${itemId}`,
            data: inentories as any,
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
