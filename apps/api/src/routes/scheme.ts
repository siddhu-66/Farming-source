import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import { z } from 'zod';
import { createApiError } from '../middleware';

const router = Router();

// GET /api/schemes - Public schemes endpoint (no auth required for browsing)
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { role, state, category, search } = req.query;

    let query = supabase.from('government_schemes').select('*', { count: 'exact' }).eq('is_active', true);
    
    if (role) query = query.contains('target_roles', [role]);
    if (category) query = query.eq('category', category);
    if (state) query = query.or(`state.eq.${state},state.is.null`);
    if (search) query = query.textSearch('title', search as string);

    const { data: schemes, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw error;
    const total = count || 0;

    // Convert snake_case back to camelCase for frontend compatibility
    const formattedSchemes = schemes?.map(s => ({
      ...s,
      targetRoles: s.target_roles,
      isActive: s.is_active,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    })) || [];

    res.json({ success: true, data: { schemes: formattedSchemes, ...buildPaginationResponse(total, page, limit) } });
  } catch (err) { next(err); }
});

// GET /api/schemes/announcements
router.get('/announcements', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: announcements, error } = await supabase.from('government_announcements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (error) throw error;
    res.json({ success: true, data: { announcements } });
  } catch (err) { next(err); }
});

// GET /api/schemes/applications/:id
router.get('/applications/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: application, error } = await supabase
      .from('scheme_applications')
      .select('*, government_schemes(*)')
      .eq('id', req.params.id)
      .eq('user_id', req.user!.id)
      .single();

    if (error || !application) throw createApiError(404, 'Application not found');
    res.json({ success: true, data: { application } });
  } catch (err) { next(err); }
});

// GET /api/schemes/:id
router.get('/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: scheme, error } = await supabase.from('government_schemes').select('*').eq('id', req.params.id).single();
    if (error || !scheme) {
      throw createApiError(404, 'Scheme not found');
    }
    res.json({ success: true, data: { scheme } });
  } catch (err) { next(err); }
});

// POST /api/schemes/eligibility
router.post('/eligibility', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schemeId } = req.body;
    if (!schemeId) throw createApiError(400, 'schemeId is required');

    // MOCK AI LOGIC FOR VOLUME 3.14
    // In production, this would call Gemini AI with the user's profile and scheme guidelines
    const score = Math.floor(Math.random() * (100 - 60 + 1) + 60);
    const recommendation = score > 80 ? 'Highly Eligible' : 'Eligible with conditions';
    
    // Save eligibility check
    await supabase.from('scheme_eligibility').insert({
      user_id: req.user!.id,
      scheme_id: schemeId,
      score,
      status: recommendation,
      checked_at: new Date().toISOString()
    });

    res.json({ success: true, data: { score, recommendation } });
  } catch (err) { next(err); }
});

// POST /api/schemes/apply
router.post('/apply', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      schemeId: z.string(),
      formData: z.record(z.any())
    });
    const { schemeId, formData } = schema.parse(req.body);

    const { data: application, error } = await supabase.from('scheme_applications').insert({
      user_id: req.user!.id,
      scheme_id: schemeId,
      form_data: formData,
      status: 'Submitted'
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data: { application } });
  } catch (err) { next(err); }
});

// POST /api/schemes/documents
router.post('/documents', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      schemeId: z.string(),
      documentType: z.string(),
      fileUrl: z.string()
    });
    const { schemeId, documentType, fileUrl } = schema.parse(req.body);

    const { data: document, error } = await supabase.from('scheme_documents').insert({
      user_id: req.user!.id,
      scheme_id: schemeId,
      document_type: documentType,
      file_url: fileUrl,
      status: 'Uploaded'
    }).select().single();

    if (error) throw error;
    res.json({ success: true, data: { document } });
  } catch (err) { next(err); }
});

export default router;
