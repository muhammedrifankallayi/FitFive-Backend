import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse, PaginatedResponse, QueryParams } from '../types';
import { InventoryModel, IInventory } from '../models/inventory.model';
import ItemModel from '../models/item.model';
import { SizeModel } from '../models/size.model';
import { ColorModel } from '../models/color.model';

export interface CreateInventoryDto {
  item: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  size: string;
  color: string;
  stock: number;
  sku?: string;
  barcode?: string;
  tags?: string[];
  attributes?: Record<string, any>;
}

export interface UpdateInventoryDto {
  item?: string;
  price?: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  size?: string;
  color?: string;
  stock?: number;
  sku?: string;
  barcode?: string;
  tags?: string[];
  attributes?: Record<string, any>;
}

class InventoryController {
  /**
   * Get all inventory items with optional filtering and pagination
   * @route GET /api/inventory
   */
  getAllInventory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as unknown as QueryParams;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const filter: any = {};
      if (search) {
        filter.$or = [
          { sku: new RegExp(search, 'i') },
          { barcode: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') },
        ];
      }

      const total = await InventoryModel.countDocuments(filter);
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
      const data = await InventoryModel.find(filter)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .sort({ [sortBy]: sortOrderNum })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .exec();

      const response: PaginatedResponse<IInventory> = {
        success: true,
        message: `Retrieved ${data.length} inventory items`,
        data: data as any,
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
   * Get inventory by ID
   * @route GET /api/inventory/:id
   */
  getInventoryById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const inventory = await InventoryModel.findById(id)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      const response: ApiResponse<IInventory> = {
        success: true,
        message: 'Inventory item retrieved successfully',
        data: inventory as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Get inventory by item ID
   * @route GET /api/inventory/item/:itemId
   */
  getInventoryByItemId = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { itemId } = req.params;

      const inventoryItems = await InventoryModel.find({ item: itemId })
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory[]> = {
        success: true,
        message: `Retrieved ${inventoryItems.length} inventory items for this product`,
        data: inventoryItems as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Create new inventory item
   * @route POST /api/inventory
   */
  createInventory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const inventoryData: CreateInventoryDto = req.body;

      // Validate required fields
      if (!inventoryData.item) {
        throw new AppError('Item reference is required', 400);
      }
      if (!inventoryData.price) {
        throw new AppError('Price is required', 400);
      }
      if (!inventoryData.size) {
        throw new AppError('Size is required', 400);
      }
      if (!inventoryData.color) {
        throw new AppError('Color is required', 400);
      }
      if (inventoryData.stock === undefined || inventoryData.stock === null) {
        throw new AppError('Stock is required', 400);
      }

      // Verify references exist
      const item = await ItemModel.findById(inventoryData.item).exec();
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      const size = await SizeModel.findById(inventoryData.size).exec();
      if (!size) {
        throw new AppError('Size not found', 404);
      }

      const color = await ColorModel.findById(inventoryData.color).exec();
      if (!color) {
        throw new AppError('Color not found', 404);
      }

      // Check for duplicate inventory (same item, size, color)
      const existingInventory = await InventoryModel.findOne({
        item: inventoryData.item,
        size: inventoryData.size,
        color: inventoryData.color,
      }).exec();

      if (existingInventory) {
        throw new AppError(
          'Inventory item with this combination of item, size, and color already exists',
          400
        );
      }

      // Create inventory item
      const inventory = await InventoryModel.create({
        item: inventoryData.item,
        price: inventoryData.price,
        compareAtPrice: inventoryData.compareAtPrice,
        costPrice: inventoryData.costPrice,
        size: inventoryData.size,
        color: inventoryData.color,
        stock: inventoryData.stock,
        sku: inventoryData.sku,
        barcode: inventoryData.barcode,
        tags: inventoryData.tags || [],
        attributes: inventoryData.attributes || {},
      });

      // Populate references before returning
      const populatedInventory = await InventoryModel.findById(inventory._id)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory> = {
        success: true,
        message: 'Inventory item created successfully',
        data: populatedInventory as any,
      };
      res.status(201).json(response);
    }
  );

  /**
   * Update inventory item
   * @route PUT /api/inventory/:id
   */
  updateInventory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const updateData: UpdateInventoryDto = req.body;

      const inventory = await InventoryModel.findById(id).exec();
      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      // Verify references if they are being updated
      if (updateData.item) {
        const item = await ItemModel.findById(updateData.item).exec();
        if (!item) {
          throw new AppError('Item not found', 404);
        }
      }

      if (updateData.size) {
        const size = await SizeModel.findById(updateData.size).exec();
        if (!size) {
          throw new AppError('Size not found', 404);
        }
      }

      if (updateData.color) {
        const color = await ColorModel.findById(updateData.color).exec();
        if (!color) {
          throw new AppError('Color not found', 404);
        }
      }

      // Check for duplicate if item/size/color are being changed
      if (updateData.item || updateData.size || updateData.color) {
        const existingInventory = await InventoryModel.findOne({
          item: updateData.item || inventory.item,
          size: updateData.size || inventory.size,
          color: updateData.color || inventory.color,
          _id: { $ne: id },
        }).exec();

        if (existingInventory) {
          throw new AppError(
            'Inventory item with this combination of item, size, and color already exists',
            400
          );
        }
      }

      // Update inventory
      const updatedInventory = await InventoryModel.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      )
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory> = {
        success: true,
        message: 'Inventory item updated successfully',
        data: updatedInventory as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Update stock quantity
   * @route PATCH /api/inventory/:id/stock
   */
  updateStock = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { stock } = req.body;

      if (stock === undefined || stock === null) {
        throw new AppError('Stock quantity is required', 400);
      }

      if (stock < 0) {
        throw new AppError('Stock cannot be negative', 400);
      }

      const inventory = await InventoryModel.findById(id).exec();
      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      inventory.stock = stock;
      await inventory.save();

      const populatedInventory = await InventoryModel.findById(inventory._id)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory> = {
        success: true,
        message: 'Stock updated successfully',
        data: populatedInventory as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Increment stock quantity
   * @route PATCH /api/inventory/:id/stock/increment
   */
  incrementStock = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity === null) {
        throw new AppError('Increment quantity is required', 400);
      }

      if (quantity <= 0) {
        throw new AppError('Increment quantity must be positive', 400);
      }

      const inventory = await InventoryModel.findById(id).exec();
      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      const oldStock = inventory.stock;
      inventory.stock += quantity;
      await inventory.save();

      const populatedInventory = await InventoryModel.findById(inventory._id)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory> = {
        success: true,
        message: `Stock incremented by ${quantity}. Previous: ${oldStock}, Current: ${inventory.stock}`,
        data: populatedInventory as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Decrement stock quantity
   * @route PATCH /api/inventory/:id/stock/decrement
   */
  decrementStock = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity === null) {
        throw new AppError('Decrement quantity is required', 400);
      }

      if (quantity <= 0) {
        throw new AppError('Decrement quantity must be positive', 400);
      }

      const inventory = await InventoryModel.findById(id).exec();
      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      const oldStock = inventory.stock;
      const newStock = inventory.stock - quantity;

      if (newStock < 0) {
        throw new AppError(
          `Cannot decrement stock by ${quantity}. Current stock: ${inventory.stock}. Insufficient stock.`,
          400
        );
      }

      inventory.stock = newStock;
      await inventory.save();

      const populatedInventory = await InventoryModel.findById(inventory._id)
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .lean()
        .exec();

      const response: ApiResponse<IInventory> = {
        success: true,
        message: `Stock decremented by ${quantity}. Previous: ${oldStock}, Current: ${inventory.stock}`,
        data: populatedInventory as any,
      };
      res.status(200).json(response);
    }
  );

  /**
   * Delete inventory item
   * @route DELETE /api/inventory/:id
   */
  deleteInventory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const inventory = await InventoryModel.findById(id).exec();
      if (!inventory) {
        throw new AppError('Inventory item not found', 404);
      }

      await InventoryModel.findByIdAndDelete(id).exec();

      const response: ApiResponse = {
        success: true,
        message: 'Inventory item deleted successfully',
      };
      res.status(200).json(response);
    }
  );

  /**
   * Get low stock items
   * @route GET /api/inventory/low-stock
   */
  getLowStock = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { threshold = 10 } = req.query;
      const stockThreshold = Number(threshold);

      const lowStockItems = await InventoryModel.find({
        stock: { $lte: stockThreshold },
      })
        .populate('item', 'name description slug images')
        .populate('size', 'name code')
        .populate('color', 'name hex rgb')
        .sort({ stock: 1 })
        .lean()
        .exec();

      const response: ApiResponse<IInventory[]> = {
        success: true,
        message: `Retrieved ${lowStockItems.length} low stock items`,
        data: lowStockItems as any,
      };
      res.status(200).json(response);
    }
  );
}

export default new InventoryController();
