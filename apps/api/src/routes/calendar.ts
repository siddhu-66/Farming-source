import { Router } from 'express';
import { authenticate } from '../middleware';
import { getEvents } from '../controllers/calendar.controller';

const router = Router();

router.use(authenticate);

router.get('/events', getEvents);

export default router;
