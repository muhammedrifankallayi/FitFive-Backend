import { Router } from 'express';
import salesOrderController from '../controllers/salesOrder.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Sales order statistics (should be before :id route)
router.get('/stats', salesOrderController.getSalesStats);

// Create sales order
router.post('/', salesOrderController.createSalesOrder);

// Get all sales orders (with pagination and optional customer filter)
router.get('/', salesOrderController.getSalesOrders);

// Get sales order by ID
router.get('/:id', salesOrderController.getSalesOrderById);

// Update sales order
router.patch('/:id', salesOrderController.updateSalesOrder);

// Delete sales order (reverses stock)
router.delete('/:id', salesOrderController.deleteSalesOrder);

export default router;