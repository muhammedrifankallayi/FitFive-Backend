import { Router } from 'express';
import colorController from '../controllers/color.controller';
import { validateCreateColor, validateUpdateColor, validateId, validateQuery } from '../middleware/validation.middleware';

const router = Router();

router.get('/', validateQuery, colorController.getAllColors);
router.get('/:id', validateId, colorController.getColorById);
router.post('/', validateCreateColor, colorController.createColor);
router.put('/:id', validateId, validateUpdateColor, colorController.updateColor);
router.delete('/:id', validateId, colorController.deleteColor);

export default router;
