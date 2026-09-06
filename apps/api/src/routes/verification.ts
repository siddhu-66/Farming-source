import express from 'express';
import { authenticate } from '../middleware/authenticate';
import { authorizeRole } from '../middleware/authorizeRole';
import { getVerificationQueue, getVerificationRequest, approveVerification, rejectVerification } from '../controllers/verification.controller';

const router = express.Router();
router.use(authenticate, authorizeRole('ADMIN', 'SUPER_ADMIN'));
router.get('/queue', getVerificationQueue);
router.get('/:requestId', getVerificationRequest);
router.post('/:requestId/approve', approveVerification);
router.post('/:requestId/reject', rejectVerification);
export default router;
