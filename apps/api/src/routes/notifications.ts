import { Router } from 'express';
import { authenticate } from '../middleware';
import { getNotifications, markRead } from '../controllers/notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.put('/read', markRead);

export default router;
