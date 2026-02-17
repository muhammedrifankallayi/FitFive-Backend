import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse } from '../types';
import { CartModel, ICart, ICartItem } from '../models/cart.model';
import Item from '../models/item.model';

export interface AddToCartDto {
  itemId: string;
  sizeId?: string;
  colorId?: string;
  qty: number;
}

export interface BulkAddToCartDto {
  items: Array<{ itemId: string; sizeId?: string; colorId?: string; qty: number }>;
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
        path: 'items.itemId',
        select: 'name description slug images price compareAtPrice isActive'
      })
      .populate('items.sizeId')
      .populate('items.colorId')
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
          path: 'items.itemId',
          select: 'name description slug images price compareAtPrice isActive'
        })
        .populate('items.sizeId')
        .populate('items.colorId')
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
    const { itemId, sizeId, colorId, qty } = req.body as AddToCartDto;

    if (!itemId || !qty) {
      throw new AppError('Item ID and quantity are required', 400);
    }

    if (qty < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    // Check if item exists
    const item = await Item.findById(itemId).exec();
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (!item.isActive) {
      throw new AppError('This item is not available', 400);
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

    // Check if item already exists in cart with same size and color
    const existingItemIndex = cart.items.findIndex(
      cartItem =>
        cartItem.itemId.toString() === itemId &&
        (cartItem.sizeId ? cartItem.sizeId.toString() : undefined) === sizeId &&
        (cartItem.colorId ? cartItem.colorId.toString() : undefined) === colorId
    );

    if (existingItemIndex > -1) {
      // Update quantity if item exists
      const newQty = cart.items[existingItemIndex].qty + qty;
      cart.items[existingItemIndex].qty = newQty;
    } else {
      // Add new item to cart
      cart.items.push({
        itemId: itemId as any,
        sizeId: sizeId as any,
        colorId: colorId as any,
        qty
      });
    }

    // Filter out any items that might have lost their itemId (e.g. deleted products)
    cart.items = cart.items.filter(item => item.itemId);

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.itemId',
        select: 'name description slug images price compareAtPrice isActive'
      })
      .populate('items.sizeId')
      .populate('items.colorId')
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
      if (!item.itemId || !item.qty) {
        throw new AppError('Each item must have itemId and qty', 400);
      }

      if (item.qty < 1) {
        throw new AppError('Quantity must be at least 1 for all items', 400);
      }
    }

    // Check availability for all items
    const itemChecks = await Promise.all(
      items.map(item => Item.findById(item.itemId).exec())
    );

    for (let i = 0; i < itemChecks.length; i++) {
      const foundItem = itemChecks[i];
      const requestItem = items[i];

      if (!foundItem) {
        throw new AppError(`Item not found for ID: ${requestItem.itemId}`, 404);
      }

      if (!foundItem.isActive) {
        throw new AppError(`Item with ID ${requestItem.itemId} is not available`, 400);
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
        cartItem =>
          cartItem.itemId?.toString() === item.itemId &&
          (cartItem.sizeId?.toString() || undefined) === (item.sizeId || undefined) &&
          (cartItem.colorId?.toString() || undefined) === (item.colorId || undefined)
      );

      if (existingItemIndex > -1) {
        // Update quantity if item exists
        const newQty = cart.items[existingItemIndex].qty + item.qty;
        cart.items[existingItemIndex].qty = newQty;
      } else {
        // Add new item to cart
        cart.items.push({
          itemId: item.itemId as any,
          sizeId: item.sizeId as any,
          colorId: item.colorId as any,
          qty: item.qty
        });
      }
    }

    // Filter out any items that might have lost their itemId (e.g. deleted products)
    cart.items = cart.items.filter(item => item.itemId);

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.itemId',
        select: 'name description slug images price compareAtPrice isActive'
      })
      .populate('items.sizeId')
      .populate('items.colorId')
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
   * @route PATCH /api/cart/items/:cartItemId
   */
  updateCartItem = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const { cartItemId } = req.params;
    const { qty } = req.body as UpdateCartItemDto;

    if (!qty || qty < 1) {
      throw new AppError('Quantity must be at least 1', 400);
    }

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      cartItem => (cartItem as any)._id.toString() === cartItemId
    );

    if (itemIndex === -1) {
      throw new AppError('Item not found in cart', 404);
    }

    const itemId = cart.items[itemIndex].itemId;
    // Check if item exists and is active
    const item = await Item.findById(itemId).exec();
    if (!item) {
      throw new AppError('Item not found', 404);
    }

    if (!item.isActive) {
      throw new AppError('This item is not available', 400);
    }

    // Update quantity
    cart.items[itemIndex].qty = qty;

    // Recalculate total amount
    cart.totalAmount = await this.calculateCartTotal(cart.items);
    await cart.save();

    // Populate cart for response
    const populatedCart = await CartModel.findById(cart._id)
      .populate({
        path: 'items.itemId',
        select: 'name description slug images price compareAtPrice isActive'
      })
      .populate('items.sizeId')
      .populate('items.colorId')
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
   * @route DELETE /api/cart/items/:cartItemId
   */
  removeFromCart = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const userId = req.user._id;
    const { cartItemId } = req.params;

    const cart = await CartModel.findOne({ userId }).exec();
    if (!cart) {
      throw new AppError('Cart not found', 404);
    }

    const itemIndex = cart.items.findIndex(
      cartItem => (cartItem as any)._id.toString() === cartItemId
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
        path: 'items.itemId',
        select: 'name description slug images price compareAtPrice isActive'
      })
      .populate('items.sizeId')
      .populate('items.colorId')
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
      if (!item.itemId) continue;

      const foundItem = await Item.findById(item.itemId).select('price').exec();
      if (foundItem) {
        total += foundItem.price * item.qty;
      }
    }

    return Math.round(total * 100) / 100; // Round to 2 decimal places
  };
}

export default new CartController();