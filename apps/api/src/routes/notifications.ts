import { Router } from 'express';
import { authenticate } from '../middleware';
import {
  getNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  notifyBuyersOfListing
} from '../controllers/notifications.controller';

const router = Router();

router.use(authenticate);

router.get('/', getNotifications);
router.patch('/:id/read', markRead);
router.patch('/read-all', markAllRead);
router.delete('/:id', deleteNotification);
router.post('/listing-created', notifyBuyersOfListing);

export default router;
