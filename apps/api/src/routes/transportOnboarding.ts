import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { completeTransportOnboarding } from '../controllers/transportOnboarding.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// @route   POST /api/v1/transport/onboarding
// @desc    Complete transport onboarding and save all data
// @access  Private (Transport only)
router.post('/', completeTransportOnboarding);

export default router;
