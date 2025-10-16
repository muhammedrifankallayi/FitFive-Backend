import { Router } from 'express';
import inventoryController from '../controllers/inventory.controller';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// Validation rules for inventory
const validateCreateInventory = [
  body('item')
    .trim()
    .notEmpty()
    .withMessage('Item reference is required')
    .isMongoId()
    .withMessage('Item must be a valid MongoDB ID'),
  body('price')
    .notEmpty()
    .withMessage('Price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('size')
    .trim()
    .notEmpty()
    .withMessage('Size is required')
    .isMongoId()
    .withMessage('Size must be a valid MongoDB ID'),
  body('color')
    .trim()
    .notEmpty()
    .withMessage('Color is required')
    .isMongoId()
    .withMessage('Color must be a valid MongoDB ID'),
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('SKU must not exceed 100 characters'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must not exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),
  handleValidationErrors,
];

const validateUpdateInventory = [
  body('item')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Item must be a valid MongoDB ID'),
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('compareAtPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Compare at price must be a positive number'),
  body('costPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Cost price must be a positive number'),
  body('size')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Size must be a valid MongoDB ID'),
  body('color')
    .optional()
    .trim()
    .isMongoId()
    .withMessage('Color must be a valid MongoDB ID'),
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  body('sku')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('SKU must not exceed 100 characters'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Barcode must not exceed 100 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('tags.*')
    .optional()
    .isString()
    .withMessage('Each tag must be a string'),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),
  handleValidationErrors,
];

const validateUpdateStock = [
  body('stock')
    .notEmpty()
    .withMessage('Stock is required')
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  handleValidationErrors,
];

const validateStockOperation = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  handleValidationErrors,
];

const validateId = [
  param('id').isMongoId().withMessage('Invalid ID format'),
  handleValidationErrors,
];

const validateItemId = [
  param('itemId').isMongoId().withMessage('Invalid item ID format'),
  handleValidationErrors,
];

const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('sortBy').optional().isString().withMessage('SortBy must be a string'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('SortOrder must be asc or desc'),
  handleValidationErrors,
];

const validateLowStockQuery = [
  query('threshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Threshold must be a non-negative integer'),
  handleValidationErrors,
];

/**
 * @route   GET /api/inventory/low-stock
 * @desc    Get low stock items
 * @access  Public
 * @query   threshold (default: 10)
 */
router.get('/low-stock', validateLowStockQuery, inventoryController.getLowStock);

/**
 * @route   GET /api/inventory/item/:itemId
 * @desc    Get all inventory items for a specific item
 * @access  Public
 */
router.get('/item/:itemId', validateItemId, inventoryController.getInventoryByItemId);

/**
 * @route   GET /api/inventory
 * @desc    Get all inventory items with pagination and filtering
 * @access  Public
 * @query   page, limit, search, sortBy, sortOrder
 */
router.get('/', validateQuery, inventoryController.getAllInventory);

/**
 * @route   GET /api/inventory/:id
 * @desc    Get inventory by ID
 * @access  Public
 */
router.get('/:id', validateId, inventoryController.getInventoryById);

/**
 * @route   POST /api/inventory
 * @desc    Create new inventory item
 * @access  Public
 * @body    { item, price, size, color, stock, compareAtPrice?, costPrice?, sku?, barcode?, tags?, attributes? }
 */
router.post('/', validateCreateInventory, inventoryController.createInventory);

/**
 * @route   PUT /api/inventory/:id
 * @desc    Update inventory item
 * @access  Public
 * @body    { item?, price?, size?, color?, stock?, compareAtPrice?, costPrice?, sku?, barcode?, tags?, attributes? }
 */
router.put('/:id', validateId, validateUpdateInventory, inventoryController.updateInventory);

/**
 * @route   PATCH /api/inventory/:id/stock
 * @desc    Update stock quantity only
 * @access  Public
 * @body    { stock }
 */
router.patch('/:id/stock', validateId, validateUpdateStock, inventoryController.updateStock);

/**
 * @route   PATCH /api/inventory/:id/stock/increment
 * @desc    Increment stock quantity
 * @access  Public
 * @body    { quantity }
 */
router.patch('/:id/stock/increment', validateId, validateStockOperation, inventoryController.incrementStock);

/**
 * @route   PATCH /api/inventory/:id/stock/decrement
 * @desc    Decrement stock quantity
 * @access  Public
 * @body    { quantity }
 */
router.patch('/:id/stock/decrement', validateId, validateStockOperation, inventoryController.decrementStock);

/**
 * @route   DELETE /api/inventory/:id
 * @desc    Delete inventory item
 * @access  Public
 */
router.delete('/:id', validateId, inventoryController.deleteInventory);

export default router;
