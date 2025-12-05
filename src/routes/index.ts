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
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import purchaseOrderRoutes from './purchaseOrder.routes';
import salesOrderRoutes from './salesOrder.routes';
import customerRoutes from './customer.routes';
import supplierRoutes from './supplier.routes';
import publicRoutes from './public.apis';
import shiprocketRoutes from '../shiprocket/routes';
import cashfreeRoutes from './cashfree.routes';

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

// Cart routes
router.use('/cart', cartRoutes);

// Public API routes (no authentication required)
router.use('/public', publicRoutes);

// Shipping address routes
router.use('/shipping-addresses', shippingRoutes);

// User routes
router.use('/users', userRoutes);

// Order routes
router.use('/orders', orderRoutes);

// Purchase Order routes
router.use('/purchase-orders', purchaseOrderRoutes);

// Sales Order routes
router.use('/sales-orders', salesOrderRoutes);

// Customer routes
router.use('/customers', customerRoutes);

// Supplier routes
router.use('/suppliers', supplierRoutes);

// Shiprocket routes
router.use('/shiprocket', shiprocketRoutes);

// CashFree payment routes
router.use('/cashfree', cashfreeRoutes);

export default router;
