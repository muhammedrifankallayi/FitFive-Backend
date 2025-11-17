import { Router } from 'express';
import purchaseOrderController from '../controllers/purchaseOrder.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Create purchase order
router.post('/', purchaseOrderController.createPurchaseOrder);

// Get all purchase orders (with pagination)
router.get('/', purchaseOrderController.getPurchaseOrders);

// Get purchase order by ID
router.get('/:id', purchaseOrderController.getPurchaseOrderById);

// Update purchase order
router.patch('/:id', purchaseOrderController.updatePurchaseOrder);

// Delete purchase order
router.delete('/:id', purchaseOrderController.deletePurchaseOrder);

export default router;
