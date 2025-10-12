import { Router } from 'express';
import itemController from '../controllers/item.controller';
import {
  validateCreateItem,
  validateUpdateItem,
  validateId,
  validateQuery,
} from '../middleware/validation.middleware';

const router = Router();

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
 * @body    { name, description, price, sku, categoryId, images[], tags[], ... }
 */
router.post('/', validateCreateItem, itemController.createItem);

/**
 * @route   PUT /api/items/:id
 * @desc    Update item
 * @access  Public
 * @body    { name?, description?, price?, images[], ... }
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

export default router;
