import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { SalesOrderModel, ISalesOrder } from '../models/salesOrder.model';
import { InventoryModel } from '../models/inventory.model';
import { CustomerModel } from '../models/customer.model';

export interface CreateSalesOrderDto {
  customerId: string;
  totalDiscount?: number;
  items: {
    inventoryId: string;
    qty: number;
    price: number;
  }[];
}

export interface UpdateSalesOrderDto {
  customerId?: string;
  totalDiscount?: number;
  items?: {
    inventoryId: string;
    qty: number;
    price: number;
  }[];
}

class SalesOrderController {
  /**
   * Create new sales order
   * @route POST /api/sales-orders
   */
  createSalesOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const { customerId, items, totalDiscount = 0 } = req.body as CreateSalesOrderDto;

    // Validate required fields
    if (!customerId) {
      throw new AppError('Customer ID is required', 400);
    }

    if (!items || items.length === 0) {
      throw new AppError('Items are required', 400);
    }

    // Validate customer exists
    const customer = await CustomerModel.findById(customerId).exec();
    if (!customer) {
      throw new AppError('Customer not found', 404);
    }

    // Validate inventory items and check stock availability
    for (const item of items) {
      const inventoryItem = await InventoryModel.findById(item.inventoryId).exec();
      if (!inventoryItem) {
        throw new AppError(`Inventory item ${item.inventoryId} not found`, 404);
      }
      
      if (!inventoryItem.isActive) {
        throw new AppError(`Inventory item ${inventoryItem.sku} is not active`, 400);
      }
      
      if (inventoryItem.stock < item.qty) {
        throw new AppError(
          `Insufficient stock for item ${inventoryItem.sku}. Available: ${inventoryItem.stock}, Required: ${item.qty}`, 
          400
        );
      }
      
      if (item.qty < 1) {
        throw new AppError('Quantity must be at least 1', 400);
      }
      
      if (item.price < 0) {
        throw new AppError('Price must be non-negative', 400);
      }
    }

    // Calculate total amount before discount
    const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const totalAmount = Math.max(0, subtotal - totalDiscount);

    // Generate unique order number
    const orderNumber = `SO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create sales order
    const salesOrder = await SalesOrderModel.create({
      userId,
      customerId,
      orderNumber,
      totalAmount,
      totalDiscount,
      items,
      salesDate: new Date()
    });

    // Update inventory stock for each item
    for (const item of items) {
      await InventoryModel.findByIdAndUpdate(
        item.inventoryId,
        { $inc: { stock: -item.qty } },
        { new: true }
      ).exec();
    }

    const populatedOrder = await SalesOrderModel.findById(salesOrder._id)
      .populate({
        path: 'items.inventoryId',
        select: 'sku size color item stock price compareAtPrice',
        populate: [
          { path: 'item', select: 'name slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .populate('userId', 'name email')
      .populate('customerId', 'name email phone address')
      .lean()
      .exec();

    const response: ApiResponse<ISalesOrder> = {
      success: true,
      message: 'Sales order created successfully',
      data: populatedOrder as any,
    };

    res.status(201).json(response);
  });

  /**
   * Get all sales orders with pagination
   * @route GET /api/sales-orders
   */
  getSalesOrders = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const customerId = req.query.customerId as string;
    const skip = (page - 1) * limit;

    // Build query
    const query: any = { userId };
    if (customerId) {
      query.customerId = customerId;
    }

    const [salesOrders, total] = await Promise.all([
      SalesOrderModel.find(query)
        .populate({
          path: 'items.inventoryId',
          select: 'sku size color item stock price',
          populate: [
            { path: 'item', select: 'name slug' },
            { path: 'size', select: 'name code' },
            { path: 'color', select: 'name hex' }
          ]
        })
        .populate('userId', 'name email')
        .populate('customerId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      SalesOrderModel.countDocuments(query)
    ]);

    const response: ApiResponse<ISalesOrder[]> = {
      success: true,
      message: 'Sales orders retrieved successfully',
      data: salesOrders as any,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };

    res.status(200).json(response);
  });

  /**
   * Get sales order by ID
   * @route GET /api/sales-orders/:id
   */
  getSalesOrderById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const salesOrder = await SalesOrderModel.findOne({ _id: id, userId })
      .populate({
        path: 'items.inventoryId',
        select: 'sku size color item stock price compareAtPrice isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .populate('userId', 'name email phone')
      .populate('customerId', 'name email phone address notes')
      .lean()
      .exec();

    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    const response: ApiResponse<ISalesOrder> = {
      success: true,
      message: 'Sales order retrieved successfully',
      data: salesOrder as any,
    };

    res.status(200).json(response);
  });

  /**
   * Update sales order
   * @route PATCH /api/sales-orders/:id
   */
  updateSalesOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;
    const { customerId, items, totalDiscount } = req.body as UpdateSalesOrderDto;

    const salesOrder = await SalesOrderModel.findOne({ _id: id, userId }).exec();
    
    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    // Store original items for stock reversal
    const originalItems = [...salesOrder.items];

    // Validate customer if being updated
    if (customerId) {
      const customer = await CustomerModel.findById(customerId).exec();
      if (!customer) {
        throw new AppError('Customer not found', 404);
      }
      salesOrder.customerId = customerId as any;
    }

    // Update discount if provided
    if (totalDiscount !== undefined) {
      if (totalDiscount < 0) {
        throw new AppError('Total discount cannot be negative', 400);
      }
      salesOrder.totalDiscount = totalDiscount;
    }

    // Update items if provided
    if (items && items.length > 0) {
      // Validate new items and stock
      for (const item of items) {
        const inventoryItem = await InventoryModel.findById(item.inventoryId).exec();
        if (!inventoryItem) {
          throw new AppError(`Inventory item ${item.inventoryId} not found`, 404);
        }
        
        if (!inventoryItem.isActive) {
          throw new AppError(`Inventory item ${inventoryItem.sku} is not active`, 400);
        }
        
        if (item.qty < 1) {
          throw new AppError('Quantity must be at least 1', 400);
        }
        
        if (item.price < 0) {
          throw new AppError('Price must be non-negative', 400);
        }
      }

      // Reverse original stock changes
      for (const originalItem of originalItems) {
        await InventoryModel.findByIdAndUpdate(
          originalItem.inventoryId,
          { $inc: { stock: originalItem.qty } },
          { new: true }
        ).exec();
      }

      // Check stock availability for new items
      for (const item of items) {
        const inventoryItem = await InventoryModel.findById(item.inventoryId).exec();
        if (inventoryItem!.stock < item.qty) {
          throw new AppError(
            `Insufficient stock for item ${inventoryItem!.sku}. Available: ${inventoryItem!.stock}, Required: ${item.qty}`, 
            400
          );
        }
      }

      // Apply new stock changes
      for (const item of items) {
        await InventoryModel.findByIdAndUpdate(
          item.inventoryId,
          { $inc: { stock: -item.qty } },
          { new: true }
        ).exec();
      }

      salesOrder.items = items as any;
    }

    // Recalculate total amount
    const subtotal = salesOrder.items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    salesOrder.totalAmount = Math.max(0, subtotal - salesOrder.totalDiscount);

    await salesOrder.save();

    const updatedOrder = await SalesOrderModel.findById(salesOrder._id)
      .populate({
        path: 'items.inventoryId',
        select: 'sku size color item stock price compareAtPrice',
        populate: [
          { path: 'item', select: 'name slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .populate('userId', 'name email phone')
      .populate('customerId', 'name email phone address notes')
      .lean()
      .exec();

    const response: ApiResponse<ISalesOrder> = {
      success: true,
      message: 'Sales order updated successfully',
      data: updatedOrder as any,
    };

    res.status(200).json(response);
  });

  /**
   * Delete sales order (reverses stock)
   * @route DELETE /api/sales-orders/:id
   */
  deleteSalesOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req.user._id;

    const salesOrder = await SalesOrderModel.findOne({ _id: id, userId }).exec();
    
    if (!salesOrder) {
      throw new AppError('Sales order not found', 404);
    }

    // Reverse stock changes
    for (const item of salesOrder.items) {
      await InventoryModel.findByIdAndUpdate(
        item.inventoryId,
        { $inc: { stock: item.qty } },
        { new: true }
      ).exec();
    }

    await SalesOrderModel.findByIdAndDelete(id).exec();

    const response: ApiResponse<null> = {
      success: true,
      message: 'Sales order deleted successfully and stock restored',
      data: null,
    };

    res.status(200).json(response);
  });

  /**
   * Get sales order statistics
   * @route GET /api/sales-orders/stats
   */
  getSalesStats = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    
    const [totalOrders, totalRevenue] = await Promise.all([
      SalesOrderModel.countDocuments({ userId }).exec(),
      SalesOrderModel.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).exec()
    ]);

    // Get recent orders (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const [recentOrders, recentRevenue] = await Promise.all([
      SalesOrderModel.countDocuments({ 
        userId,
        createdAt: { $gte: thirtyDaysAgo }
      }).exec(),
      SalesOrderModel.aggregate([
        { 
          $match: { 
            userId: userId,
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        { $group: { _id: null, total: { $sum: '$totalAmount' } } }
      ]).exec()
    ]);

    const response: ApiResponse<{
      totalOrders: number;
      totalRevenue: number;
      recentOrders: number;
      recentRevenue: number;
    }> = {
      success: true,
      message: 'Sales statistics retrieved successfully',
      data: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        recentOrders,
        recentRevenue: recentRevenue[0]?.total || 0
      },
    };

    res.status(200).json(response);
  });
}

export default new SalesOrderController();