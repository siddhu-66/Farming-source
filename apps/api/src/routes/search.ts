import { Router } from 'express';
import { authenticate } from '../middleware';
import { globalSearch } from '../controllers/topbar.controller';

const router = Router();

router.use(authenticate);

// GET /api/v1/search/global
router.get('/global', globalSearch);

export default router;
