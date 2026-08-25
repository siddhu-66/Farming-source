import { Router } from 'express';
import { authenticate } from '../middleware';
import { getMessages } from '../controllers/messages.controller';

const router = Router();

router.use(authenticate);

router.get('/', getMessages);

export default router;
