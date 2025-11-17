import { Router } from 'express';
import supplierController from '../controllers/supplier.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Supplier statistics (should be before :id route)
router.get('/stats', supplierController.getSupplierStats);

// Create supplier
router.post('/', supplierController.createSupplier);

// Get all suppliers (with pagination and search)
router.get('/', supplierController.getAllSuppliers);

// Get supplier by ID
router.get('/:id', supplierController.getSupplierById);

// Update supplier
router.patch('/:id', supplierController.updateSupplier);

// Delete supplier
router.delete('/:id', supplierController.deleteSupplier);

export default router;