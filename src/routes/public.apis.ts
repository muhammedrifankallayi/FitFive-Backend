import { Router } from 'express';
import publicApiController from '../controllers/public.api.controller';

const router = Router();


router.get('/items',publicApiController.getAvailableItems);
router.get('/categories',publicApiController.getAllCategories);
router.get('/variants/:itemId',publicApiController.getVariantsByItemId);

export default router;