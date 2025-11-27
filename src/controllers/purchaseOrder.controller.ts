import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { PurchaseOrderModel, IPurchaseOrder } from '../models/purchaseOrder.model';
import { InventoryModel } from '../models/inventory.model';
import { SupplierModel } from '../models/supplier.model';

export interface CreatePurchaseOrderDto {
  supplierId: string;
  purchaseDate?: Date;
  discount?: number;
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  items: {
    inventoryId: string;
    qty: number;
    price: number;
  }[];
}

export interface UpdatePurchaseOrderDto {
  supplierId?: string;
  purchaseDate?: Date;
  discount?: number;
  status?: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  items?: {
    inventoryId: string;
    qty: number;
    price: number;
  }[];
}

class PurchaseOrderController {
  /**
   * Create new purchase order
   * @route POST /api/purchase-orders
   */
  createPurchaseOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req?.user?._id;
    const { supplierId, items, purchaseDate, discount = 0, status = 'pending', notes } = req.body as CreatePurchaseOrderDto;

    if (!supplierId) {
      throw new AppError('Supplier ID is required', 400);
    }

    if (!items || items.length === 0) {
      throw new AppError('Items are required', 400);
    }

    // Validate supplier exists
    const supplier = await SupplierModel.findById(supplierId).exec();
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Validate inventory items exist and extract proper IDs
    const processedItems = [];
    for (const item of items) {
      // Handle both string ID and object with _id
      const inventoryId = typeof item.inventoryId === 'string' 
        ? item.inventoryId 
        : (item.inventoryId as any)._id;

      const inventoryItem = await InventoryModel.findById(inventoryId).exec();
      if (!inventoryItem) {
        throw new AppError(`Inventory item ${inventoryId} not found`, 404);
      }
      if (item.qty < 1) {
        throw new AppError('Quantity must be at least 1', 400);
      }
      if (item.price < 0) {
        throw new AppError('Price must be non-negative', 400);
      }
      
      processedItems.push({
        inventoryId,
        qty: item.qty,
        price: item.price
      });
    }

    // Calculate total amount before discount
    const subtotal = processedItems.reduce((sum, item) => sum + (item.qty * item.price), 0);
    const totalAmount = Math.max(0, subtotal - (discount || 0));

    // Generate unique order number
    const orderNumber = `PO-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const purchaseOrder = await PurchaseOrderModel.create({
      userId,
      supplierId,
      orderNumber,
      totalAmount,
      discount,
      status,
      notes,
      purchaseDate: purchaseDate || new Date(),
      items: processedItems
    });

    const populatedOrder = await PurchaseOrderModel.findById(purchaseOrder._id)
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
      .populate('supplierId', 'name email phone address')
      .lean()
      .exec();

    const response: ApiResponse<IPurchaseOrder> = {
      success: true,
      message: 'Purchase order created successfully',
      data: populatedOrder as any,
    };

    res.status(201).json(response);
  });

  /**
   * Get all purchase orders
   * @route GET /api/purchase-orders
   */
  getPurchaseOrders = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req?.user?._id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const query: any = {};
    if (userId) {
      query.userId = userId;
    }

    const [purchaseOrders, total] = await Promise.all([
      PurchaseOrderModel.find(query)
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
        .populate('supplierId', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
        .exec(),
      PurchaseOrderModel.countDocuments(query)
    ]);

    const response: ApiResponse<IPurchaseOrder[]> = {
      success: true,
      message: 'Purchase orders retrieved successfully',
      data: purchaseOrders as any,
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
   * Get purchase order by ID
   * @route GET /api/purchase-orders/:id
   */
  getPurchaseOrderById = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req?.user?._id;

    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const purchaseOrder = await PurchaseOrderModel.findOne(query)
      .populate({
        path: 'items.inventoryId',
        select: 'sku size color item stock price',
        populate: [
          { path: 'item', select: 'name slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .populate('userId', 'name email phone')
      .populate('supplierId', 'name email phone address notes')
      .lean()
      .exec();

    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    const response: ApiResponse<IPurchaseOrder> = {
      success: true,
      message: 'Purchase order retrieved successfully',
      data: purchaseOrder as any,
    };

    res.status(200).json(response);
  });

  /**
   * Update purchase order
   * @route PATCH /api/purchase-orders/:id
   */
  updatePurchaseOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req?.user?._id;
    const { supplierId, items } = req.body as UpdatePurchaseOrderDto;

    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const purchaseOrder = await PurchaseOrderModel.findOne(query).exec();
    
    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    // Validate supplier if being updated
    if (supplierId) {
      const supplier = await SupplierModel.findById(supplierId).exec();
      if (!supplier) {
        throw new AppError('Supplier not found', 404);
      }
      purchaseOrder.supplierId = supplierId as any;
    }

    if (items && items.length > 0) {
      // Validate inventory items exist
      for (const item of items) {
        const inventoryItem = await InventoryModel.findById(item.inventoryId).exec();
        if (!inventoryItem) {
          throw new AppError(`Inventory item ${item.inventoryId} not found`, 404);
        }
        if (item.qty < 1) {
          throw new AppError('Quantity must be at least 1', 400);
        }
        if (item.price < 0) {
          throw new AppError('Price must be non-negative', 400);
        }
      }

      purchaseOrder.items = items as any;
      purchaseOrder.totalAmount = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }

    await purchaseOrder.save();

    const updatedOrder = await PurchaseOrderModel.findById(purchaseOrder._id)
      .populate({
        path: 'items.inventoryId',
        select: 'sku size color item stock price',
        populate: [
          { path: 'item', select: 'name slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .populate('userId', 'name email phone')
      .populate('supplierId', 'name email phone address notes')
      .lean()
      .exec();

    const response: ApiResponse<IPurchaseOrder> = {
      success: true,
      message: 'Purchase order updated successfully',
      data: updatedOrder as any,
    };

    res.status(200).json(response);
  });

  /**
   * Delete purchase order
   * @route DELETE /api/purchase-orders/:id
   */
  deletePurchaseOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const userId = req?.user?._id;

    const query: any = { _id: id };
    if (userId) {
      query.userId = userId;
    }

    const purchaseOrder = await PurchaseOrderModel.findOneAndDelete(query).exec();
    
    if (!purchaseOrder) {
      throw new AppError('Purchase order not found', 404);
    }

    const response: ApiResponse<null> = {
      success: true,
      message: 'Purchase order deleted successfully',
      data: null,
    };

    res.status(200).json(response);
  });
}

export default new PurchaseOrderController();
