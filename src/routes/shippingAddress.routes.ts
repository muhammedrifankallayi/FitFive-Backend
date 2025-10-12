import { Router } from 'express';
import shippingController from '../controllers/shippingAddress.controller';
import { validateId, validateQuery, validateCreateShippingAddress, validateUpdateShippingAddress } from '../middleware/validation.middleware';

const router = Router();

router.get('/', validateQuery, shippingController.getAll);
router.get('/:id', validateId, shippingController.getById);
router.post('/', validateCreateShippingAddress, shippingController.create);
router.put('/:id', validateId, validateUpdateShippingAddress, shippingController.update);
router.delete('/:id', validateId, shippingController.delete);

export default router;
