import { Router } from 'express';
import userController from '../controllers/user.controller';
import { validateCreateUser, validateId } from '../middleware/validation.middleware';

const router = Router();

router.get('/', userController.getAllUsers);
router.post('/', validateCreateUser, userController.createUser);
router.patch('/:id/status', validateId, userController.updateUserStatus);

export default router;
