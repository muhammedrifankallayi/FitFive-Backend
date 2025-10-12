import { Router } from 'express';
import categoryController from '../controllers/category.controller';
import {
  validateCreateCategory,
  validateUpdateCategory,
  validateId,
  validateQuery,
} from '../middleware/validation.middleware';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories with pagination and filtering
 * @access  Public
 * @query   page, limit, search, isActive, sortBy, sortOrder
 */
router.get('/', validateQuery, categoryController.getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', validateId, categoryController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Public
 * @body    { name, description, images[], parentId?, isActive? }
 */
router.post('/', validateCreateCategory, categoryController.createCategory);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Public
 * @body    { name?, description?, images[], parentId?, isActive? }
 */
router.put(
  '/:id',
  validateId,
  validateUpdateCategory,
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Public
 */
router.delete('/:id', validateId, categoryController.deleteCategory);

/**
 * @route   GET /api/categories/:id/items
 * @desc    Get category with all its items
 * @access  Public
 */
router.get('/:id/items', validateId, categoryController.getCategoryWithItems);

export default router;
