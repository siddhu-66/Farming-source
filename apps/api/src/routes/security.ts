import { Router, Request, Response, NextFunction } from 'express';
import { getUserEvents, getEventDetails } from '../controllers/security.controller';
import { authenticate, authorizeRole } from '../middleware';
import SecurityService from '../services/security.service';
import { supabase } from '../config/supabase';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

router.get('/events', authenticate, getUserEvents);
router.get('/events/:id', authenticate, getEventDetails);

// --- Admin Security Endpoints ---
router.use(authenticate, authorizeRole('admin'));

router.get('/audit-logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    
    const { data, error, count } = await supabase
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);
      
    if (error) throw error;
    res.json({ success: true, data, total: count });
  } catch (err) {
    next(err);
  }
});

router.get('/alerts', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const alerts = await SecurityService.getAlerts(page, limit);
    res.json({ success: true, ...alerts });
  } catch (err) {
    next(err);
  }
});

router.post('/incidents', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const incident = await SecurityService.createIncident(req.body, req.user!.id);
    res.json({ success: true, data: incident });
  } catch (err) {
    next(err);
  }
});

router.get('/backups', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('backup_history')
      .select('*, backup_jobs(*)')
      .order('started_at', { ascending: false })
      .limit(20);
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.post('/backup/run', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { jobName, type } = req.body;
    const result = await SecurityService.triggerBackup(jobName || 'Manual Backup', type || 'FULL', req.user!.id);
    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
