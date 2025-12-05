import { Router } from 'express';
import itemController from '../controllers/item.controller';
import { protect } from '../middleware/auth.middleware';
import { body } from 'express-validator';
import {
  validateCreateItem,
  validateUpdateItem,
  validateId,
  validateQuery,
  handleValidationErrors,
} from '../middleware/validation.middleware';

const router = Router();

// Validation rules for reviews
const validateAddReview = [
  body('rating')
    .notEmpty()
    .withMessage('Rating is required')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  handleValidationErrors,
];

const validateUpdateReview = [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters'),
  handleValidationErrors,
];

/**
 * @route   GET /api/items
 * @desc    Get all items with pagination and filtering
 * @access  Public
 * @query   page, limit, search, categoryId, isActive, sortBy, sortOrder
 */
router.get('/', validateQuery, itemController.getAllItems);

/**
 * @route   GET /api/items/:id
 * @desc    Get item by ID
 * @access  Public
 */
router.get('/:id', validateId, itemController.getItemById);

/**
 * @route   POST /api/items
 * @desc    Create new item
 * @access  Public
 * @body    { name, description, categoryId, image?, tags?, attributes?, isActive?, isFeatured? }
 */
router.post('/', validateCreateItem, itemController.createItem);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Public
 * @body    { name?, description?, categoryId?, image?, tags?, attributes?, isActive?, isFeatured? }
 */
router.put('/:id', validateId, validateUpdateItem, itemController.updateItem);

/**
 * @route   DELETE /api/items/:id
 * @desc    Delete item
 * @access  Public
 */
router.delete('/:id', validateId, itemController.deleteItem);

/**
 * @route   GET /api/items/category/:categoryId
 * @desc    Get all items by category
 * @access  Public
 */
router.get('/category/:categoryId', validateId, itemController.getItemsByCategory);

/**
 * @route   POST /api/items/:id/reviews
 * @desc    Add review to item
 * @access  Private
 * @body    { rating, comment? }
 */
router.post('/:id/reviews', protect, validateId, validateAddReview, itemController.addReview);

/**
 * @route   GET /api/items/:id/reviews
 * @desc    Get all reviews for item
 * @access  Public
 */
router.get('/:id/reviews', validateId, itemController.getReviews);

/**
 * @route   PUT /api/items/:id/reviews/:reviewId
 * @desc    Update review for item
 * @access  Private
 * @body    { rating?, comment? }
 */
router.put('/:id/reviews/:reviewId', protect, validateId, validateUpdateReview, itemController.updateReview);

/**
 * @route   DELETE /api/items/:id/reviews/:reviewId
 * @desc    Delete review for item
 * @access  Private
 */
router.delete('/:id/reviews/:reviewId', protect, validateId, itemController.deleteReview);

export default router;
