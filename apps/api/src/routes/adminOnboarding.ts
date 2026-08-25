import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { completeAdminOnboarding } from '../controllers/adminOnboarding.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// @route   POST /api/v1/admin/onboarding/complete
// @desc    Complete admin onboarding and save all data
// @access  Private (Admin only)
router.post('/complete', completeAdminOnboarding);

export default router;
