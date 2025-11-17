import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import Order, { IOrder, IOrderItem } from '../models/order.model';
import { InventoryModel } from '../models/inventory.model';
import User from '../models/user.model';
import { Types } from 'mongoose';

class OrderController {
  /**
   * Create a new order
   * @route POST /api/orders
   * @access Private
   */
  createOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        items,
        paymentDetails,
        deliveryType,
        shippingAddress,
        billingAddress,
        notes,
        discount = 0,
      } = req.body;

      // Get user ID from authenticated request
      const userId = (req as any).user?.id;
      if (!userId) {
        throw new AppError('User authentication required', 401);
      }

      // Validate user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404);
      }

      // Validate items array
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError('Order must contain at least one item', 400);
      }

      // Validate and calculate total amount
      let totalAmount = 0;
      const validatedItems: IOrderItem[] = [];

      for (const item of items) {
        const { inventoryId, qty } = item;

        // Validate inventory ID
        if (!inventoryId || !Types.ObjectId.isValid(inventoryId)) {
          throw new AppError('Invalid inventory ID', 400);
        }

        // Validate quantity
        if (!qty || qty < 1) {
          throw new AppError('Quantity must be at least 1', 400);
        }

        // Check if inventory item exists and has sufficient stock
        const inventoryItem = await InventoryModel.findById(inventoryId)
          .populate('item')
          .populate('size')
          .populate('color');

        if (!inventoryItem) {
          throw new AppError(`Inventory item not found: ${inventoryId}`, 404);
        }

        if (!inventoryItem.isActive) {
          throw new AppError(`Item is not available: ${(inventoryItem.item as any)?.name}`, 400);
        }

        if (inventoryItem.stock < qty) {
          throw new AppError(
            `Insufficient stock for ${(inventoryItem.item as any)?.name}. Available: ${inventoryItem.stock}, Requested: ${qty}`,
            400
          );
        }

        // Add to validated items
        validatedItems.push({
          inventoryId: new Types.ObjectId(inventoryId),
          qty,
        });

        // Calculate total amount
        totalAmount += inventoryItem.price * qty;
      }

      // Validate discount
      if (discount < 0 || discount > totalAmount) {
        throw new AppError('Invalid discount amount', 400);
      }

      // Create the order
      const newOrder = new Order({
        userId: new Types.ObjectId(userId),
        items: validatedItems,
        paymentDetails,
        totalAmount,
        discount,
        deliveryType: deliveryType || 'standard',
        shippingAddress,
        billingAddress: billingAddress || shippingAddress,
        notes,
      });

      await newOrder.save();

      // Update inventory stock
      for (const item of validatedItems) {
        await InventoryModel.findByIdAndUpdate(
          item.inventoryId,
          { $inc: { stock: -item.qty } },
          { new: true }
        );
      }

      // Populate the order with related data
      const populatedOrder = await Order.findById(newOrder._id)
        .populate({
          path: 'userId',
          select: 'name email phone',
        })
        .populate({
          path: 'items.inventoryId',
          populate: [
            { path: 'item', select: 'name description image' },
            { path: 'size', select: 'name code' },
            { path: 'color', select: 'name code' },
          ],
        });

      const response: ApiResponse<IOrder> = {
        success: true,
        message: 'Order created successfully',
        data: populatedOrder!,
      };

      res.status(201).json(response);
    }
  );

  /**
   * Cancel an order
   * @route POST /api/orders/:id/cancel
   * @access Private
   */
  cancelOrder = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { cancellationReason } = req.body;
      const userId = (req as any).user?.id;

      // Validate order ID
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid order ID', 400);
      }

      // Find the order
      const order = await Order.findById(id).populate({
        path: 'items.inventoryId',
        populate: [
          { path: 'item', select: 'name' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name code' },
        ],
      });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user owns the order or is admin
      const user = (req as any).user;
      if (order.userId.toString() !== userId && user.role !== 'admin') {
        throw new AppError('Not authorized to cancel this order', 403);
      }

      // Check if order can be cancelled
      const canCancel = ['pending', 'confirmed'].includes(order.status);
      if (!canCancel) {
        throw new AppError(
          `Order cannot be cancelled. Current status: ${order.status}`,
          400
        );
      }

      // Cancel the order manually
      try {
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = cancellationReason || 'Cancelled by user';
        await order.save();

        // Restore inventory stock
        for (const item of order.items) {
          await InventoryModel.findByIdAndUpdate(
            item.inventoryId._id,
            { $inc: { stock: item.qty } },
            { new: true }
          );
        }

        // Update payment status if payment was made
        if (order.paymentStatus === 'paid') {
          order.paymentStatus = 'refunded';
          await order.save();
        }

        const response: ApiResponse<IOrder> = {
          success: true,
          message: 'Order cancelled successfully',
          data: order,
        };

        res.status(200).json(response);
      } catch (error: any) {
        throw new AppError(error.message || 'Failed to cancel order', 400);
      }
    }
  );

  /**
   * Get all orders for a user or all orders (admin)
   * @route GET /api/orders
   * @access Private
   */
  getAllOrders = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        status,
        paymentStatus,
        sortBy = 'orderDate',
        sortOrder = 'desc',
      } = req.query;

      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Build query
      const query: any = {};

      // If not admin, only show user's orders
      if (userRole !== 'admin') {
        query.userId = userId;
      }

      // Filter by status if provided
      if (status) {
        query.status = status;
      }

      // Filter by payment status if provided
      if (paymentStatus) {
        query.paymentStatus = paymentStatus;
      }

      // Calculate pagination
      const pageNum = Math.max(1, parseInt(page as string));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string)));
      const skip = (pageNum - 1) * limitNum;

      // Build sort object
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      // Execute query
      const [orders, total] = await Promise.all([
        Order.find(query)
          .populate({
            path: 'userId',
            select: 'name email phone',
          })
          .populate({
            path: 'items.inventoryId',
            populate: [
              { path: 'item', select: 'name description image' },
              { path: 'size', select: 'name code' },
              { path: 'color', select: 'name code' },
            ],
          })
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Order.countDocuments(query),
      ]);

      const response: ApiResponse<IOrder[]> = {
        success: true,
        message: `Retrieved ${orders.length} orders`,
        data: orders as any[],
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
   * Get order by ID
   * @route GET /api/orders/:id
   * @access Private
   */
  getOrderById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Validate order ID
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid order ID', 400);
      }

      // Find the order
      const order = await Order.findById(id)
        .populate({
          path: 'userId',
          select: 'name email phone',
        })
        .populate({
          path: 'items.inventoryId',
          populate: [
            { path: 'item', select: 'name description image' },
            { path: 'size', select: 'name code' },
            { path: 'color', select: 'name code' },
          ],
        });

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user owns the order or is admin
      if (order.userId._id.toString() !== userId && userRole !== 'admin') {
        throw new AppError('Not authorized to view this order', 403);
      }

      const response: ApiResponse<IOrder> = {
        success: true,
        message: 'Order retrieved successfully',
        data: order,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Update order status (admin only)
   * @route PUT /api/orders/:id/status
   * @access Private/Admin
   */
  updateOrderStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { status, trackingNumber, notes } = req.body;

      // Validate order ID
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid order ID', 400);
      }

      // Find the order
      const order = await Order.findById(id);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Update order fields
      if (status) {
        order.status = status;
      }

      if (trackingNumber) {
        order.trackingNumber = trackingNumber;
      }

      if (notes) {
        order.notes = notes;
      }

      // Save the updated order
      await order.save();

      // Populate the updated order
      const updatedOrder = await Order.findById(order._id)
        .populate({
          path: 'userId',
          select: 'name email phone',
        })
        .populate({
          path: 'items.inventoryId',
          populate: [
            { path: 'item', select: 'name description image' },
            { path: 'size', select: 'name code' },
            { path: 'color', select: 'name code' },
          ],
        });

      const response: ApiResponse<IOrder> = {
        success: true,
        message: 'Order status updated successfully',
        data: updatedOrder!,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Update payment status
   * @route PUT /api/orders/:id/payment
   * @access Private
   */
  updatePaymentStatus = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { paymentStatus, transactionId, paidAt } = req.body;
      const userId = (req as any).user?.id;
      const userRole = (req as any).user?.role;

      // Validate order ID
      if (!Types.ObjectId.isValid(id)) {
        throw new AppError('Invalid order ID', 400);
      }

      // Find the order
      const order = await Order.findById(id);

      if (!order) {
        throw new AppError('Order not found', 404);
      }

      // Check if user owns the order or is admin
      if (order.userId.toString() !== userId && userRole !== 'admin') {
        throw new AppError('Not authorized to update this order', 403);
      }

      // Update payment details
      order.paymentStatus = paymentStatus;

      if (transactionId) {
        order.paymentDetails.transactionId = transactionId;
      }

      if (paidAt) {
        order.paymentDetails.paidAt = new Date(paidAt);
      }

      await order.save();

      const response: ApiResponse<IOrder> = {
        success: true,
        message: 'Payment status updated successfully',
        data: order,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Get order statistics (admin only)
   * @route GET /api/orders/stats
   * @access Private/Admin
   */
  getOrderStats = asyncHandler(
    async (_req: Request, res: Response, _next: NextFunction) => {
      const stats = await Order.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$totalAmount' },
          },
        },
      ]);

      const response: ApiResponse<any> = {
        success: true,
        message: 'Order statistics retrieved successfully',
        data: stats,
      };

      res.status(200).json(response);
    }
  );
}

export default new OrderController();