import { Router } from 'express';
import { completeOnboarding } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.post('/complete', completeOnboarding);

export default router;
