import { Router } from 'express';
import * as healthController from '../controllers/health.controller';

const router = Router();

router.get('/', healthController.getHealth);
router.get('/database', healthController.getDatabaseHealth);
router.get('/storage', healthController.getStorageHealth);
router.get('/socket', healthController.getSocketHealth);

// Stub placeholders for weather and ai health
router.get('/weather', (req, res) => res.json({ success: true, message: 'Weather service OK' }));
router.get('/ai', (req, res) => res.json({ success: true, message: 'AI service OK' }));

router.get('/auth', healthController.getAuthHealth);

export default router;
