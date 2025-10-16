import { Router } from 'express';
import authRoutes from './auth.routes';
import pickupRoutes from './pickup.routes';

const router = Router();

// Shiprocket authentication routes
router.use('/auth', authRoutes);

// Shiprocket pickup routes
router.use('/pickup', pickupRoutes);

export default router;