import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { completeBuyerOnboarding } from '../controllers/buyerOnboarding.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// @route   POST /api/v1/buyer/onboarding
// @desc    Complete buyer onboarding and save all data
// @access  Private (Buyer only)
router.post('/', completeBuyerOnboarding);

export default router;
