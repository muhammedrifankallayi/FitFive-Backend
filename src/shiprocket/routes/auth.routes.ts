import { Router } from 'express';
import { body } from 'express-validator';
import { handleValidationErrors } from '../../middleware/validation.middleware';
import shiprocketAuthController from '../controllers/auth.controller';

const router = Router();

// Validation rules for login
const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 1 })
    .withMessage('Password cannot be empty'),
  handleValidationErrors,
];

/**
 * @route   POST /api/shiprocket/auth/login
 * @desc    Login to Shiprocket and get authentication token
 * @access  Public
 * @body    { email, password }
 */
router.post('/login', validateLogin, shiprocketAuthController.login);

/**
 * @route   POST /api/shiprocket/auth/logout
 * @desc    Logout from Shiprocket and invalidate token
 * @access  Private (requires Bearer token)
 * @headers { Authorization: Bearer <token> }
 */
router.post('/logout', shiprocketAuthController.logout);

export default router;