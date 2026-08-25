import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { 
  getVerificationQueue, 
  getVerificationRequest, 
  approveVerification, 
  rejectVerification 
} from '../controllers/verification.controller';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authenticate);

// Admin-only middleware could be added here if we had one extracted, 
// for now we'll assume authenticate attaches the user and we can verify role in the controller,
// or we can add a quick check here.
const requireAdmin = (req: any, res: any, next: any) => {
  if (req.user && (req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN')) {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Access denied. Admins only.' });
  }
};

router.use(requireAdmin);

// @route   GET /api/v1/verification/queue
// @desc    Get all pending verification requests
router.get('/queue', getVerificationQueue);

// @route   GET /api/v1/verification/:requestId
// @desc    Get details of a single request
router.get('/:requestId', getVerificationRequest);

// @route   POST /api/v1/verification/:requestId/approve
// @desc    Approve a request
router.post('/:requestId/approve', approveVerification);

// @route   POST /api/v1/verification/:requestId/reject
// @desc    Reject a request
router.post('/:requestId/reject', rejectVerification);

export default router;
