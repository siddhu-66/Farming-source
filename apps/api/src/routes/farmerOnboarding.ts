import { Router } from 'express';
import { completeFarmerOnboarding } from '../controllers/farmerOnboarding.controller';
import { authenticate, authorizeRole } from '../middleware';

const router = Router();

// Apply authentication and farmer role authorization to all routes in this file
router.use(authenticate);
router.use(authorizeRole('FARMER'));

router.post('/complete', completeFarmerOnboarding);

export default router;
