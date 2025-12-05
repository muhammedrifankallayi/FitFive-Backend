import { Router } from 'express';
import cartController from '../controllers/cart.controller';
import { protect } from '../middleware/auth.middleware';
import { validateId } from '../middleware/validation.middleware';

const router = Router();

// All cart routes require authentication
router.use(protect);

// Get user's cart
router.get('/', cartController.getCart);

// Get cart item count
router.get('/count', cartController.getCartCount);

// Add item to cart
router.post('/add', cartController.addToCart);

// Add multiple items to cart (bulk)
router.post('/bulk-add', cartController.bulkAddToCart);

// Update cart item quantity
router.patch('/items/:inventoryId', validateId, cartController.updateCartItem);

// Remove item from cart
router.delete('/items/:inventoryId', validateId, cartController.removeFromCart);

// Clear entire cart
router.delete('/', cartController.clearCart);

export default router;