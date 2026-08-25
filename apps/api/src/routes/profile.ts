import { Router } from 'express';
import { getProfile, updateProfile, uploadAvatar, savePreferences } from '../controllers/profile.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/', getProfile);
router.patch('/', updateProfile);
router.post('/avatar', uploadAvatar);
router.patch('/preferences', savePreferences);

export default router;
