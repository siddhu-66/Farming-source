import { Router } from 'express';
import { getDashboardBootstrap, getDashboardHome, getDashboardStats, getDashboardCharts, getDashboardActivity, getDashboardTasks, getDashboardOrders, postDashboardPreferences } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.get('/bootstrap', authenticate, getDashboardBootstrap);
router.get('/home', authenticate, getDashboardHome);
router.get('/stats', authenticate, getDashboardStats);
router.get('/charts', authenticate, getDashboardCharts);
router.get('/activity', authenticate, getDashboardActivity);
router.get('/tasks', authenticate, getDashboardTasks);
router.get('/orders', authenticate, getDashboardOrders);
router.post('/preferences', authenticate, postDashboardPreferences);

export default router;
