import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middleware/error.middleware';
import { ApiResponse, CreateItemDto, UpdateItemDto, PaginatedResponse, QueryParams } from '../types';
import ItemModel, { IItem } from '../models/item.model';
import CategoryModel from '../models/category.model';
class ItemController {
  /**
   * Get all items with optional filtering and pagination
   * @route GET /api/items
   */
  getAllItems = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const {
        page = 1,
        limit = 10,
        search,
        categoryId,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as unknown as QueryParams;

      const pageNum = Number(page);
      const limitNum = Number(limit);

      const filter: any = {};
      if (search) {
        // use text index if available, fallback to regex
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { tags: new RegExp(search, 'i') },
        ];
      }
      if (categoryId) filter.categoryId = categoryId;
      if (isActive !== undefined) filter.isActive = isActive;

      const total = await ItemModel.countDocuments(filter);
      const sortOrderNum = sortOrder === 'asc' ? 1 : -1;
      const data = await ItemModel.find(filter).populate('categoryId')
        .sort({ [sortBy]: sortOrderNum })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .lean()
        .exec();

      const response: PaginatedResponse<IItem> = {
        success: true,
        message: `Retrieved ${data.length} items`,
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
   * Get item by ID
   * @route GET /api/items/:id
   */
  getItemById = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const item = await ItemModel.findById(id).lean().exec();
      if (!item) throw new AppError('Item not found', 404);

      const response: ApiResponse<IItem> = { success: true, message: 'Item retrieved successfully', data: item as any };
      res.status(200).json(response);
    }
  );

  /**
   * Create new item
   * @route POST /api/items
   */
  createItem = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const itemData: CreateItemDto = req.body;

      if (!itemData.name) {
        throw new AppError('Name is required', 400);
      }

      if (!itemData.categoryId) {
        throw new AppError('Category ID is required', 400);
      }

      const category = await CategoryModel.findById(itemData.categoryId).exec();
      if (!category) throw new AppError('Category not found', 404);

      const slug = itemData.slug || itemData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');

      // create item using ItemModel. Map provided fields where applicable
      const createdItem = await ItemModel.create({
        name: itemData.name,
        description: itemData.description,
        slug,
        categoryId: itemData.categoryId,
        images: itemData.images || [],
        price: itemData.price,
        compareAtPrice: itemData.compareAtPrice || null,
        costPrice: itemData.costPrice || null,
        tags: itemData.tags || [],
        attributes: itemData.attributes || {},
        isActive: itemData.isActive !== undefined ? itemData.isActive : true,
        isFeatured: itemData.isFeatured || false,
      });

      const response: ApiResponse<IItem> = {
        success: true,
        message: 'Item created successfully',
        data: createdItem as any,
      };

      res.status(201).json(response);
    }
  );

  /**
   * Update item
   * @route PUT /api/items/:id
   */
  updateItem = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const updates: UpdateItemDto = req.body;

      const existingItem = await ItemModel.findById(id).exec();
      if (!existingItem) throw new AppError('Item not found', 404);

      if (updates.categoryId) {
        const category = await CategoryModel.findById(updates.categoryId).exec();
        if (!category) throw new AppError('Category not found', 404);
      }

      const updatedItem = await ItemModel.findByIdAndUpdate(id, updates as any, { new: true }).lean().exec();

      const response: ApiResponse<IItem> = {
        success: true,
        message: 'Item updated successfully',
        data: updatedItem as any,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete item
   * @route DELETE /api/items/:id
   */
  deleteItem = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const existing = await ItemModel.findById(id).exec();
      if (!existing) throw new AppError('Item not found', 404);

      await ItemModel.findByIdAndDelete(id).exec();

      const response: ApiResponse = { success: true, message: 'Item deleted successfully' };
      res.status(200).json(response);
    }
  );

  /**
   * Get items by category
   * @route GET /api/items/category/:categoryId
   */
  getItemsByCategory = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { categoryId } = req.params;

      // Check if category exists
      const category = await CategoryModel.findById(categoryId).exec();
      if (!category) throw new AppError('Category not found', 404);

      const items = await ItemModel.find({ categoryId }).lean().exec();

      const response: ApiResponse<IItem[]> = {
        success: true,
        message: `Found ${items.length} items in this category`,
        data: items as any,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Add review to item
   * @route POST /api/items/:id/reviews
   */
  addReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;
      const { rating, comment } = req.body;
      const userId = (req as any).user?._id;

      if (!userId) {
        throw new AppError('User authentication required', 401);
      }

      // Validate rating
      if (!rating || rating < 1 || rating > 5) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      // Find the item
      const item = await ItemModel.findById(id).exec();
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // Check if user already reviewed this item
      const existingReview = item.reviews?.find(
        (review: any) => review.userId.toString() === userId.toString()
      );

      if (existingReview) {
        throw new AppError('You have already reviewed this item', 409);
      }

      // Add review
      if (!item.reviews) {
        item.reviews = [];
      }

      item.reviews.push({
        userId,
        rating,
        comment: comment?.trim() || undefined,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);

      await item.save();

      // Populate userId in review for response
      const populatedItem = await ItemModel.findById(id)
        .populate({
          path: 'reviews.userId',
          select: 'name email avatar',
        })
        .lean()
        .exec();

      const response: ApiResponse<IItem> = {
        success: true,
        message: 'Review added successfully',
        data: populatedItem as any,
      };

      res.status(201).json(response);
    }
  );

  /**
   * Get reviews for item
   * @route GET /api/items/:id/reviews
   */
  getReviews = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id } = req.params;

      const item = await ItemModel.findById(id)
        .populate({
          path: 'reviews.userId',
          select: 'name email avatar',
        })
        .lean()
        .exec();

      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // Calculate average rating
      const reviews = item.reviews || [];
      const averageRating = reviews.length > 0
        ? (reviews.reduce((sum: number, review: any) => sum + review.rating, 0) / reviews.length).toFixed(2)
        : 0;

      const response: ApiResponse<any> = {
        success: true,
        message: 'Reviews retrieved successfully',
        data: {
          reviews,
          totalReviews: reviews.length,
          averageRating: parseFloat(averageRating as string),
        },
      };

      res.status(200).json(response);
    }
  );

  /**
   * Update review for item
   * @route PUT /api/items/:id/reviews/:reviewId
   */
  updateReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id, reviewId } = req.params;
      const { rating, comment } = req.body;
      const userId = (req as any).user?._id;

      if (!userId) {
        throw new AppError('User authentication required', 401);
      }

      // Validate rating
      if (rating && (rating < 1 || rating > 5)) {
        throw new AppError('Rating must be between 1 and 5', 400);
      }

      const item = await ItemModel.findById(id).exec();
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // Find the review
      const review = item.reviews?.find((r: any) => r._id?.toString() === reviewId);
      if (!review) {
        throw new AppError('Review not found', 404);
      }

      // Check if user owns the review
      if (review.userId.toString() !== userId.toString()) {
        throw new AppError('You can only update your own reviews', 403);
      }

      // Update review
      if (rating) review.rating = rating;
      if (comment !== undefined) review.comment = comment?.trim() || undefined;
      review.updatedAt = new Date();

      await item.save();

      const populatedItem = await ItemModel.findById(id)
        .populate({
          path: 'reviews.userId',
          select: 'name email avatar',
        })
        .lean()
        .exec();

      const response: ApiResponse<IItem> = {
        success: true,
        message: 'Review updated successfully',
        data: populatedItem as any,
      };

      res.status(200).json(response);
    }
  );

  /**
   * Delete review for item
   * @route DELETE /api/items/:id/reviews/:reviewId
   */
  deleteReview = asyncHandler(
    async (req: Request, res: Response, _next: NextFunction) => {
      const { id, reviewId } = req.params;
      const userId = (req as any).user?._id;

      if (!userId) {
        throw new AppError('User authentication required', 401);
      }

      const item = await ItemModel.findById(id).exec();
      if (!item) {
        throw new AppError('Item not found', 404);
      }

      // Find the review
      const reviewIndex = item.reviews?.findIndex((r: any) => r._id?.toString() === reviewId);
      if (reviewIndex === -1 || reviewIndex === undefined) {
        throw new AppError('Review not found', 404);
      }

      const review = item.reviews![reviewIndex];

      // Check if user owns the review
      if (review.userId.toString() !== userId.toString()) {
        throw new AppError('You can only delete your own reviews', 403);
      }

      // Remove review
      item.reviews!.splice(reviewIndex, 1);
      await item.save();

      const response: ApiResponse = {
        success: true,
        message: 'Review deleted successfully',
        data: null,
      };

      res.status(200).json(response);
    }
  );
}

export default new ItemController();
