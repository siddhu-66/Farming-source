import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { z } from 'zod';
import { createApiError } from '../middleware';

const router = Router();

// GET /api/reports
router.get('/', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: reports, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: { reports } });
  } catch (err) { next(err); }
});

// POST /api/reports/generate
router.post('/generate', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      reportType: z.string(),
      dateRange: z.object({
        start: z.string(),
        end: z.string()
      }).optional(),
      filters: z.record(z.any()).optional(),
      format: z.string()
    });
    
    const { reportType, dateRange, filters, format } = schema.parse(req.body);

    // MOCK REPORT GENERATION
    const reportName = `${reportType} Report - ${new Date().toLocaleDateString()}`;
    const fileUrl = `https://example.com/reports/${req.user!.id}/mock_report.${format.toLowerCase()}`;

    const { data: report, error } = await supabase.from('generated_reports').insert({
      user_id: req.user!.id,
      title: reportName,
      type: reportType,
      format,
      file_url: fileUrl,
      parameters: { dateRange, filters }
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data: { report } });
  } catch (err) { next(err); }
});

// POST /api/reports/schedule
router.post('/schedule', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      reportType: z.string(),
      frequency: z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly']),
      deliveryMethod: z.array(z.string())
    });
    
    const { reportType, frequency, deliveryMethod } = schema.parse(req.body);

    const { data: schedule, error } = await supabase.from('scheduled_reports').insert({
      user_id: req.user!.id,
      type: reportType,
      frequency,
      delivery_methods: deliveryMethod,
      is_active: true
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data: { schedule } });
  } catch (err) { next(err); }
});

// GET /api/reports/export/:reportId
router.get('/export/:reportId', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: report, error } = await supabase
      .from('generated_reports')
      .select('*')
      .eq('id', req.params.reportId)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !report) throw createApiError(404, 'Report not found');
    
    res.json({ success: true, data: { downloadUrl: report.file_url } });
  } catch (err) { next(err); }
});

export default router;
