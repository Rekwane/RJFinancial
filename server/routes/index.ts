import { Router } from 'express';
import authRoutes from './authRoutes';
import paymentRoutes from './paymentRoutes';

const router = Router();

// Register route groups
router.use('/auth', authRoutes);
router.use('/payment', paymentRoutes);

export default router;