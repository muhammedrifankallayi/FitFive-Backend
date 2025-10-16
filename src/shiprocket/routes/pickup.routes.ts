import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.middleware';
import shiprocketPickupController from '../controllers/pickup.controller';

const router = Router();

// Validation rules for add pickup
const validateAddPickup = [
  body('pickup_location')
    .trim()
    .notEmpty()
    .withMessage('Pickup location is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Pickup location must be between 1 and 255 characters'),
  
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 255 })
    .withMessage('Name must be between 1 and 255 characters'),
  
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),
  
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Please provide a valid 10-digit Indian phone number'),
  
  body('address')
    .trim()
    .notEmpty()
    .withMessage('Address is required')
    .isLength({ min: 10, max: 500 })
    .withMessage('Address must be between 10 and 500 characters'),
  
  body('address_2')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Address 2 must not exceed 500 characters'),
  
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('City must be between 1 and 100 characters'),
  
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('State must be between 1 and 100 characters'),
  
  body('country')
    .trim()
    .notEmpty()
    .withMessage('Country is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Country must be between 1 and 100 characters'),
  
  body('pin_code')
    .trim()
    .notEmpty()
    .withMessage('PIN code is required')
    .matches(/^\d{6}$/)
    .withMessage('Please provide a valid 6-digit PIN code'),
  
  handleValidationErrors,
];

/**
 * @route   POST /api/shiprocket/pickup/add
 * @desc    Add a new pickup address to Shiprocket
 * @access  Private (requires Bearer token)
 * @headers { Authorization: Bearer <token> }
 * @body    { pickup_location, name, email, phone, address, address_2?, city, state, country, pin_code }
 */
router.post('/add', validateAddPickup, shiprocketPickupController.addPickup);

/**
 * @route   GET /api/shiprocket/pickup/list
 * @desc    Get list of pickup addresses from Shiprocket
 * @access  Private (requires Bearer token)
 * @headers { Authorization: Bearer <token> }
 */
router.get('/list', shiprocketPickupController.listPickup);

export default router;