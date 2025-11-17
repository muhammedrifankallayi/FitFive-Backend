import { Router } from 'express';
import orderController from '../controllers/order.controller';
import { protect, restrictTo } from '../middleware/auth.middleware';
import { body, param, query } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// Validation rules for creating order
const validateCreateOrder = [
  body('items')
    .isArray({ min: 1 })
    .withMessage('Items must be an array with at least one item'),
  body('items.*.inventoryId')
    .notEmpty()
    .withMessage('Inventory ID is required')
    .isMongoId()
    .withMessage('Inventory ID must be a valid MongoDB ID'),
  body('items.*.qty')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  body('paymentDetails')
    .isObject()
    .withMessage('Payment details are required'),
  body('paymentDetails.method')
    .isIn(['cash', 'card', 'upi', 'netbanking', 'wallet'])
    .withMessage('Payment method must be one of: cash, card, upi, netbanking, wallet'),
  body('paymentDetails.transactionId')
    .optional()
    .isString()
    .trim()
    .withMessage('Transaction ID must be a string'),
  body('deliveryType')
    .optional()
    .isIn(['standard', 'express', 'overnight', 'pickup'])
    .withMessage('Delivery type must be one of: standard, express, overnight, pickup'),
  body('shippingAddress')
    .isObject()
    .withMessage('Shipping address is required'),
  body('shippingAddress.name')
    .trim()
    .notEmpty()
    .withMessage('Shipping address name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('shippingAddress.phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('shippingAddress.email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('shippingAddress.address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  body('shippingAddress.city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ max: 100 })
    .withMessage('City cannot exceed 100 characters'),
  body('shippingAddress.state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ max: 100 })
    .withMessage('State cannot exceed 100 characters'),
  body('shippingAddress.country')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Country cannot exceed 100 characters'),
  body('shippingAddress.pincode')
    .trim()
    .notEmpty()
    .withMessage('Pincode is required')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Please provide a valid 6-digit pincode'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors,
];

// Validation rules for cancelling order
const validateCancelOrder = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('cancellationReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Cancellation reason cannot exceed 500 characters'),
  handleValidationErrors,
];

// Validation rules for updating order status
const validateUpdateOrderStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, returned'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Tracking number cannot exceed 100 characters'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  handleValidationErrors,
];

// Validation rules for updating payment status
const validateUpdatePaymentStatus = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('paymentStatus')
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded, partially_refunded'),
  body('transactionId')
    .optional()
    .trim()
    .isString()
    .withMessage('Transaction ID must be a string'),
  body('paidAt')
    .optional()
    .isISO8601()
    .withMessage('Paid at must be a valid date'),
  handleValidationErrors,
];

// Validation rules for query parameters
const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Status must be one of: pending, confirmed, processing, shipped, delivered, cancelled, returned'),
  query('paymentStatus')
    .optional()
    .isIn(['pending', 'paid', 'failed', 'refunded', 'partially_refunded'])
    .withMessage('Payment status must be one of: pending, paid, failed, refunded, partially_refunded'),
  query('sortBy')
    .optional()
    .isIn(['orderDate', 'totalAmount', 'status', 'paymentStatus'])
    .withMessage('Sort by must be one of: orderDate, totalAmount, status, paymentStatus'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  handleValidationErrors,
];

// Validation for order ID parameter
const validateId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid order ID'),
  handleValidationErrors,
];

/**
 * @route   POST /api/orders
 * @desc    Create a new order
 * @access  Private
 * @body    { items, paymentDetails, deliveryType, shippingAddress, billingAddress?, discount?, notes? }
 */
router.post('/', protect, validateCreateOrder, orderController.createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get all orders (user's orders or all orders for admin)
 * @access  Private
 * @query   page, limit, status, paymentStatus, sortBy, sortOrder
 */
router.get('/', protect, validateQuery, orderController.getAllOrders);

/**
 * @route   GET /api/orders/stats
 * @desc    Get order statistics (admin only)
 * @access  Private/Admin
 */
router.get('/stats', protect, restrictTo('admin'), orderController.getOrderStats);

/**
 * @route   GET /api/orders/:id
 * @desc    Get order by ID
 * @access  Private
 */
router.get('/:id', protect, validateId, orderController.getOrderById);

/**
 * @route   POST /api/orders/:id/cancel
 * @desc    Cancel an order
 * @access  Private
 * @body    { cancellationReason? }
 */
router.post('/:id/cancel', protect, validateCancelOrder, orderController.cancelOrder);

/**
 * @route   PUT /api/orders/:id/status
 * @desc    Update order status (admin only)
 * @access  Private/Admin
 * @body    { status?, trackingNumber?, notes? }
 */
router.put('/:id/status', protect, restrictTo('admin'), validateUpdateOrderStatus, orderController.updateOrderStatus);

/**
 * @route   PUT /api/orders/:id/payment
 * @desc    Update payment status
 * @access  Private
 * @body    { paymentStatus, transactionId?, paidAt? }
 */
router.put('/:id/payment', protect, validateUpdatePaymentStatus, orderController.updatePaymentStatus);

export default router;