import { Router } from 'express';
import customerController from '../controllers/customer.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Customer statistics (should be before :id route)
router.get('/stats', customerController.getCustomerStats);

// Create customer
router.post('/', customerController.createCustomer);

// Get all customers (with pagination and search)
router.get('/', customerController.getAllCustomers);

// Get customer by ID
router.get('/:id', customerController.getCustomerById);

// Update customer
router.patch('/:id', customerController.updateCustomer);

// Delete customer
router.delete('/:id', customerController.deleteCustomer);

export default router;