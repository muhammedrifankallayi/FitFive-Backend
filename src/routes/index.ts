import { Router } from 'express';
import uploadRoutes from './upload.routes';
import itemRoutes from './item.routes';
import categoryRoutes from './category.routes';
import authRoutes from './auth.routes';
import sizeRoutes from './size.routes';
import colorRoutes from './color.routes';
import shippingRoutes from './shippingAddress.routes';
import userRoutes from './user.routes';
import inventoryRoutes from './inventory.routes';
import shiprocketRoutes from '../shiprocket/routes';

const router = Router();

// Health check endpoint
router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
router.use('/auth', authRoutes);

// Upload routes
router.use('/upload', uploadRoutes);

// Item routes
router.use('/items', itemRoutes);

// Category routes
router.use('/categories', categoryRoutes);

// Size routes
router.use('/sizes', sizeRoutes);

// Color routes
router.use('/colors', colorRoutes);

// Inventory routes
router.use('/inventory', inventoryRoutes);

// Shipping address routes
router.use('/shipping-addresses', shippingRoutes);

// User routes
router.use('/users', userRoutes);

// Shiprocket routes
router.use('/shiprocket', shiprocketRoutes);

export default router;
