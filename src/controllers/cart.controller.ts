import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { CartModel, ICart, ICartItem } from '../models/cart.model';
import { InventoryModel } from '../models/inventory.model';

export interface AddToCartDto {
  inventoryId: string;
  qty: number;
}

export interface BulkAddToCartDto {
  items: Array<{ inventoryId: string; qty: number }>;
}

export interface UpdateCartItemDto {
  qty: number;
}

class CartController {
  /**
   * Get user's cart
   * @route GET /api/cart
   */
  getCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;

    let cart = await CartModel.findOne({ userId })
      .populate({
        path: 'items.inventoryId',
        select: 'price compareAtPrice size color item stock sku isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .lean()
      .exec();

    if (!cart) {
      // Create empty cart if doesn't exist
      const newCart = await CartModel.create({
        userId,
        items: [],
        totalAmount: 0
      });
      
      cart = await CartModel.findById(newCart._id)
        .populate({
          path: 'items.inventoryId',
          select: 'price compareAtPrice size color item stock sku isActive',
          populate: [
            { path: 'item', select: 'name description slug images' },
            { path: 'size', select: 'name code' },
            { path: 'color', select: 'name hex rgb' }
          ]
        })
        .lean()
        .exec();
    }

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart retrieved successfully',
      data: cart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Add item to cart
   * @route POST /api/cart/add
   */
  addToCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?._id;
    const { inventoryId, qty } = req.body as AddToCartDto;

    if (!inventoryId || !qty) {
      throw new AppError('Inventory ID and quantity are required', 400);
    }

    if (qty < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    // Check if inventory item exists and has enough stock
    const inventoryItem = await InventoryModel.findById(inventoryId).exec();
    if (!inventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }

    if (!inventoryItem.isActive) {
      throw new AppError('This item is not available', 400);
    }

    if (inventoryItem.stock < qty) {
      throw new AppError(`Only ${inventoryItem.stock} items available in stock`, 400);
    }

    // Find or create cart
    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({
        userId,
        items: [],
        totalAmount: 0
      });
    }

    // Check if item already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.inventoryId.toString() === inventoryId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQty = cart.items[existingItemIndex].qty + qty;
      
      if (inventoryItem.stock < newQty) {
        throw new AppError(`Only ${inventoryItem.stock} items available in stock`, 400);
      }
      
      cart.items[existingItemIndex].qty = newQty;
    } else {
      // Add new item to cart
      cart.items.push({
        inventoryId: inventoryId as any,
        qty
      });
    }

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.inventoryId',
        select: 'price compareAtPrice size color item stock sku isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .lean()
      .exec();

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Item added to cart successfully',
      data: populatedCart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Add multiple items to cart (bulk)
   * @route POST /api/cart/bulk-add
   */
  bulkAddToCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user?._id;
    const { items } = req.body as BulkAddToCartDto;

    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError('Items array is required and must not be empty', 400);
    }

    // Validate each item
    for (const item of items) {
      if (!item.inventoryId || !item.qty) {
        throw new AppError('Each item must have inventoryId and qty', 400);
      }

      if (item.qty < 1) {
        throw new AppError('Quantity must be at least 1 for all items', 400);
      }
    }

    // Check inventory availability for all items
    const inventoryChecks = await Promise.all(
      items.map(item => InventoryModel.findById(item.inventoryId).exec())
    );

    for (let i = 0; i < inventoryChecks.length; i++) {
      const inventory = inventoryChecks[i];
      const item = items[i];

      if (!inventory) {
        throw new AppError(`Inventory item not found for ID: ${item.inventoryId}`, 404);
      }

      if (!inventory.isActive) {
        throw new AppError(`Item with ID ${item.inventoryId} is not available`, 400);
      }

      if (inventory.stock < item.qty) {
        throw new AppError(
          `Only ${inventory.stock} items available in stock for ID: ${item.inventoryId}`,
          400
        );
      }
    }

    // Find or create cart
    let cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      cart = new CartModel({
        userId,
        items: [],
        totalAmount: 0
      });
    }

    // Add or update items in cart
    for (const item of items) {
      const existingItemIndex = cart.items.findIndex(
        cartItem => cartItem.inventoryId.toString() === item.inventoryId
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newQty = cart.items[existingItemIndex].qty + item.qty;
        const inventory = inventoryChecks[items.indexOf(item)];

        if (!inventory || inventory.stock < newQty) {
          throw new AppError(
            `Only ${inventory?.stock || 0} items available in stock for ID: ${item.inventoryId}`,
            400
          );
        }

        cart.items[existingItemIndex].qty = newQty;
      } else {
        // Add new item to cart
        cart.items.push({
          inventoryId: item.inventoryId as any,
          qty: item.qty
        });
      }
    }

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.inventoryId',
        select: 'price compareAtPrice size color item stock sku isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .lean()
      .exec();

    const response: ApiResponse<ICart> = {
      success: true,
      message: `${items.length} item(s) added to cart successfully`,
      data: populatedCart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Update cart item quantity
   * @route PATCH /api/cart/items/:inventoryId
   */
  updateCartItem = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const { inventoryId } = req.params;
    const { qty } = req.body as UpdateCartItemDto;

    if (!qty || qty < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    // Check if inventory item exists and has enough stock
    const inventoryItem = await InventoryModel.findById(inventoryId).exec();
    if (!inventoryItem) {
      throw new AppError('Inventory item not found', 404);
    }

    if (!inventoryItem.isActive) {
      throw new AppError('This item is not available', 400);
    }

    if (inventoryItem.stock < qty) {
      throw new AppError(`Only ${inventoryItem.stock} items available in stock`, 400);
    }

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.inventoryId.toString() === inventoryId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    // Update quantity
    cart.items[itemIndex].qty = qty;

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.inventoryId',
        select: 'price compareAtPrice size color item stock sku isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .lean()
      .exec();

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart item updated successfully',
      data: populatedCart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Remove item from cart
   * @route DELETE /api/cart/items/:inventoryId
   */
  removeFromCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const { inventoryId } = req.params;

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      item => item.inventoryId.toString() === inventoryId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    // Remove item from cart
    cart.items.splice(itemIndex, 1);

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.inventoryId',
        select: 'price compareAtPrice size color item stock sku isActive',
        populate: [
          { path: 'item', select: 'name description slug images' },
          { path: 'size', select: 'name code' },
          { path: 'color', select: 'name hex rgb' }
        ]
      })
      .lean()
      .exec();

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Item removed from cart successfully',
      data: populatedCart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Clear cart
   * @route DELETE /api/cart
   */
  clearCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    const response: ApiResponse<ICart> = {
      success: true,
      message: 'Cart cleared successfully',
      data: cart as any,
    };

    res.status(200).json(response);
  });

  /**
   * Get cart item count
   * @route GET /api/cart/count
   */
  getCartCount = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;

    const cart = await CartModel.findOne({ userId }).select('items').lean().exec();
    
    const count = cart ? cart.items.reduce((total, item) => total + item.qty, 0) : 0;

    const response: ApiResponse<{ count: number }> = {
      success: true,
      message: 'Cart count retrieved successfully',
      data: { count },
    };

    res.status(200).json(response);
  });

  /**
   * Calculate total amount for cart items
   */
  private calculateCartTotal = async (items: ICartItem[]): Promise<number> => {
    let total = 0;

    for (const item of items) {
      const inventoryItem = await InventoryModel.findById(item.inventoryId).select('price').exec();
      if (inventoryItem) {
        total += inventoryItem.price * item.qty;
      }
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };
}

export default new CartController();