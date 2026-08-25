import { Router } from 'express';
import { getSidebarConfig, getPermissions, getQuickActions } from '../controllers/navigation.controller';
import { getTopbarConfig, getBreadcrumbs } from '../controllers/topbar.controller';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.use(authenticate);

router.get('/sidebar', getSidebarConfig);
router.get('/permissions', getPermissions);
router.get('/quick-actions', getQuickActions);
router.get('/topbar', getTopbarConfig);
router.get('/breadcrumb', getBreadcrumbs);

export default router;
