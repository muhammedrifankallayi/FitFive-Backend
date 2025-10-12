import { Router } from 'express';
import sizeController from '../controllers/size.controller';
import { validateCreateSize, validateUpdateSize, validateId, validateQuery } from '../middleware/validation.middleware';

const router = Router();

router.get('/', validateQuery, sizeController.getAllSizes);
router.get('/:id', validateId, sizeController.getSizeById);
router.post('/', validateCreateSize, sizeController.createSize);
router.put('/:id', validateId, validateUpdateSize, sizeController.updateSize);
router.delete('/:id', validateId, sizeController.deleteSize);

export default router;
