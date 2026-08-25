import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { completeIndustryOnboarding } from '../controllers/industryOnboarding.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// @route   POST /api/v1/industry/onboarding
// @desc    Complete industry onboarding and save all data
// @access  Private (Industry only)
router.post('/', completeIndustryOnboarding);

export default router;
