import { Request, Response, NextFunction } from 'express';
import { body, param, query, validationResult } from 'express-validator';
import { AppError } from './error.middleware';

// Validation error handler
export const handleValidationErrors = (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessages = errors
      .array()
      .map((err) => `${err.type === 'field' ? (err as any).path : 'unknown'}: ${err.msg}`)
      .join(', ');
    throw new AppError(`Validation error: ${errorMessages}`, 400);
  }
  next();
};

// Item validations
export const validateCreateItem = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('Name must be between 3 and 200 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
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
  body('sku')
    .trim()
    .notEmpty()
    .withMessage('SKU is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Barcode must not exceed 50 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('categoryId')
    .trim()
    .notEmpty()
    .withMessage('Category ID is required')
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  handleValidationErrors,
];

export const validateUpdateItem = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Name must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
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
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('SKU must be between 2 and 50 characters'),
  body('barcode')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Barcode must not exceed 50 characters'),
  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Quantity must be a non-negative integer'),
  body('categoryId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Category ID must be a valid UUID'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array of strings'),
  body('tags.*').optional().isString().withMessage('Each tag must be a string'),
  body('attributes')
    .optional()
    .isObject()
    .withMessage('Attributes must be an object'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('isFeatured must be a boolean'),
  handleValidationErrors,
];

// Category validations
export const validateCreateCategory = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required')
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Slug must be a valid URL-friendly string'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string'),
  body('parentId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

export const validateUpdateCategory = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Description must be at least 10 characters'),
  body('slug')
    .optional()
    .trim()
    .isSlug()
    .withMessage('Slug must be a valid URL-friendly string'),
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of strings'),
  body('images.*')
    .optional()
    .isString()
    .withMessage('Each image must be a string'),
  body('parentId')
    .optional()
    .trim()
    .isUUID()
    .withMessage('Parent ID must be a valid UUID'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  handleValidationErrors,
];

// Size validations
export const validateCreateSize = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Code must not exceed 20 characters'),
  handleValidationErrors,
];

export const validateUpdateSize = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Name must be between 1 and 50 characters'),
  body('code')
    .optional()
    .trim()
    .isLength({ max: 20 })
    .withMessage('Code must not exceed 20 characters'),
  handleValidationErrors,
];

// Color validations
export const validateCreateColor = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('hex')
    .optional()
    .trim()
    .matches(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .withMessage('hex must be a valid hex color'),
  body('rgb')
    .optional()
    .trim()
    .matches(/^rgb\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)$/)
    .withMessage('rgb must be a valid rgb(...) string'),
  handleValidationErrors,
];

export const validateUpdateColor = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be between 1 and 100 characters'),
  body('hex')
    .optional()
    .trim()
    .matches(/^#([0-9A-Fa-f]{3}){1,2}$/)
    .withMessage('hex must be a valid hex color'),
  body('rgb')
    .optional()
    .trim()
    .matches(/^rgb\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)$/)
    .withMessage('rgb must be a valid rgb(...) string'),
  handleValidationErrors,
];

// ID validation
export const validateId = [
  param('id').trim().isUUID().withMessage('ID must be a valid UUID'),
  handleValidationErrors,
];

// Query validation
export const validateQuery = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Search query must not be empty'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('sortBy must not be empty'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('sortOrder must be either asc or desc'),
  handleValidationErrors,
];

// Shipping Address validations
export const validateCreateShippingAddress = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone is required')
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid'),
  body('addressLine1')
    .trim()
    .notEmpty()
    .withMessage('Address line 1 is required')
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .trim()
    .notEmpty()
    .withMessage('City is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .notEmpty()
    .withMessage('State is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('pinCode')
    .trim()
    .notEmpty()
    .withMessage('Pin code is required')
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Pin code must be a valid 6-digit code'),
  handleValidationErrors,
];

export const validateUpdateShippingAddress = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[6-9]\d{9}$/)
    .withMessage('Phone must be a valid 10-digit number'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid'),
  body('addressLine1')
    .optional()
    .trim()
    .isLength({ min: 5, max: 200 })
    .withMessage('Address must be between 5 and 200 characters'),
  body('city')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('pinCode')
    .optional()
    .trim()
    .matches(/^[1-9][0-9]{5}$/)
    .withMessage('Pin code must be a valid 6-digit code'),
  handleValidationErrors,
];

// User validations
export const validateCreateUser = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Email must be valid'),
  body('role')
    .trim()
    .notEmpty()
    .withMessage("Role is required and must be either 'user' or 'admin'")
    .isIn(['user', 'admin'])
    .withMessage("Role must be either 'user' or 'admin'"),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('avatar')
    .optional()
    .isString()
    .withMessage('avatar must be a string (url)'),
  handleValidationErrors,
];

export const validateUpdateUser = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Email must be valid'),
  body('role')
    .optional()
    .trim()
    .isIn(['user', 'admin'])
    .withMessage("Role must be either 'user' or 'admin'"),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('avatar')
    .optional()
    .isString()
    .withMessage('avatar must be a string (url)'),
  handleValidationErrors,
];
