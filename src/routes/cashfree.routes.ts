import { Router } from 'express';
import cashFreeController from '../controllers/cashFreeIntegration.controller';
import { protect } from '../middleware/auth.middleware';
import { body, param } from 'express-validator';
import { handleValidationErrors } from '../middleware/validation.middleware';

const router = Router();

// Validation rules for creating payment order
const validateCreatePaymentOrder = [

  body('amount')
    .notEmpty()
    .withMessage('Amount is required')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('customerId')
    .notEmpty()
    .withMessage('Customer ID is required')
    .isString()
    .trim(),
  body('customerPhone')
    .notEmpty()
    .withMessage('Customer phone is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  body('returnUrl')
    .optional()
    .isURL()
    .withMessage('Return URL must be a valid URL'),
  handleValidationErrors,
];

// Validation rules for order ID parameter
const validateOrderId = [
  param('orderId')
    .notEmpty()
    .withMessage('Order ID is required'),
  handleValidationErrors,
];

/**
 * @route   POST /api/cashfree/create-order
 * @desc    Create a payment order in CashFree
 * @access  Private
 * @body    { orderId, amount, customerId, customerPhone, returnUrl? }
 */
router.post(
  '/create-order',
  validateCreatePaymentOrder,
  cashFreeController.createPaymentOrder
);

/**
 * @route   GET /api/cashfree/order/:orderId
 * @desc    Get payment order status from CashFree
 * @access  Private
 * @params  orderId
 */
router.get(
  '/order/:orderId',
  protect,
  validateOrderId,
  cashFreeController.getOrderStatus
);

/**
 * @route   POST /api/cashfree/webhook
 * @desc    Handle payment callback from CashFree
 * @access  Public (should be verified with CashFree signature)
 * @body    { orderId, orderAmount, paymentStatus, transactionId?, paymentMessage? }
 */
router.post(
  '/webhook',
  cashFreeController.handlePaymentCallback
);

export default router;
