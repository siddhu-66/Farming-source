import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole } from '../middleware';
import { supabase } from '../config/supabase';
import SystemService from '../services/system.service';

interface AuthRequest extends Request {
  user?: any;
}

const router = Router();

router.use(authenticate, authorizeRole('admin'));

router.get('/health', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('health_checks')
      .select('*')
      .order('checked_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/configuration', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('system_configuration')
      .select('*')
      .order('updated_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/status', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data, error } = await supabase
      .from('node_status')
      .select('*')
      .order('last_heartbeat_at', { ascending: false });
      
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

router.get('/metrics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const metrics = await SystemService.getMetrics();
    res.json({ success: true, data: metrics });
  } catch (err) {
    next(err);
  }
});

router.get('/version', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const versionInfo = await SystemService.getVersion();
    res.json({ success: true, data: versionInfo });
  } catch (err) {
    next(err);
  }
});

router.post('/cache/clear', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { cacheKey } = req.body;
    const result = await SystemService.clearCache(cacheKey);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
});

router.get('/logs', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const level = req.query.level as string | undefined;
    
    const logsData = await SystemService.getLogs(page, limit, level);
    res.json({ success: true, ...logsData });
  } catch (err) {
    next(err);
  }
});

router.post('/deploy', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { version, environment } = req.body;
    const job = await SystemService.triggerDeployment(
      version || 'latest',
      environment || 'PRODUCTION',
      req.user!.id
    );
    res.json({ success: true, data: job });
  } catch (err) {
    next(err);
  }
});

router.post('/rollback', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { deploymentId, toVersion, reason } = req.body;
    const rollback = await SystemService.rollbackDeployment(
      deploymentId,
      toVersion,
      reason || 'Emergency Rollback',
      req.user!.id
    );
    res.json({ success: true, data: rollback });
  } catch (err) {
    next(err);
  }
});

router.get('/releases', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const releasesData = await SystemService.getReleases(page, limit);
    res.json({ success: true, ...releasesData });
  } catch (err) {
    next(err);
  }
});

router.get('/maintenance', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schedule = await SystemService.getMaintenanceSchedule();
    res.json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
});
export default router;
