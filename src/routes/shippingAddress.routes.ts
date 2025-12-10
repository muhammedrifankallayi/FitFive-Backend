import { Router } from 'express';
import shippingController from '../controllers/shippingAddress.controller';
import { validateId, validateQuery, validateCreateShippingAddress, validateUpdateShippingAddress } from '../middleware/validation.middleware';
import { protect } from '../middleware/auth.middleware';

const router = Router();

router.get('/', protect, validateQuery, shippingController.getAll);
router.get('/:id', protect, validateId, shippingController.getById);
router.post('/', protect, validateCreateShippingAddress, shippingController.create);
router.put('/:id', protect, validateId, validateUpdateShippingAddress, shippingController.update);
router.delete('/:id', protect, validateId, shippingController.delete);

export default router;
