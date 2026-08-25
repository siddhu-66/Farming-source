import { Router } from 'express';
import { authenticate } from '../middleware';
import { getMarketSummary } from '../controllers/topbar.controller';

const router = Router();

router.use(authenticate);

// GET /api/v1/market/summary
router.get('/summary', getMarketSummary);

export default router;
