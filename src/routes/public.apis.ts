import { Router } from 'express';
import publicApiController from '../controllers/public.api.controller';

const router = Router();

router.get('/items', publicApiController.getAvailableItems);
router.get('/items/:itemId', publicApiController.getItemById);
router.get('/categories', publicApiController.getAllCategories);

export default router;