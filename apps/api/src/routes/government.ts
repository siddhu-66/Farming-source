import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';

const router = Router();

// Middleware to ensure user is authenticated
router.use(authenticate);

// Helper function to map snake_case to camelCase
const toCamel = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(v => toCamel(v));
  if (obj !== null && obj !== undefined && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((result, key) => {
      const camelKey = key.replace(/_([a-z])/g, g => g[1].toUpperCase());
      result[camelKey] = toCamel(obj[key]);
      return result;
    }, {} as any);
  }
  return obj;
};

// GET /api/v1/government/schemes
router.get('/schemes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { category, state } = req.query;
    
    let query = supabase.from('government_schemes').select('*').eq('status', 'active');
    if (category) query = query.eq('category', category);
    if (state) query = query.eq('state', state);

    const { data: schemes, error } = await query;
    if (error) throw error;

    res.json({ success: true, data: { schemes: toCamel(schemes) } });
  } catch (err) { next(err); }
});

// GET /api/v1/government/schemes/:id
router.get('/schemes/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: scheme, error } = await supabase
      .from('government_schemes')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!scheme) throw createApiError(404, 'Scheme not found');

    res.json({ success: true, data: { scheme: toCamel(scheme) } });
  } catch (err) { next(err); }
});

// POST /api/v1/government/eligibility
router.post('/eligibility', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schemeId } = req.body;
    
    // Simulate AI Eligibility Engine
    const score = Math.floor(Math.random() * 101); // 0-100
    let tier = 'Not Recommended';
    if (score >= 90) tier = 'Highly Recommended';
    else if (score >= 75) tier = 'Recommended';
    else if (score >= 50) tier = 'Possible Match';

    const report = {
      schemeId,
      score,
      recommendationTier: tier,
      reasons: ["Matches crop type", "Income criteria met"],
      missingDocuments: ["Soil Health Card"]
    };

    res.json({ success: true, data: { eligibilityReport: report } });
  } catch (err) { next(err); }
});

// POST /api/v1/government/applications
router.post('/applications', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { schemeId, submittedDocuments } = req.body;

    const { data: application, error } = await supabase
      .from('farmer_applications')
      .insert({
        farmer_id: req.user!.id,
        scheme_id: schemeId,
        status: 'submitted',
        submitted_documents: submittedDocuments,
        ai_validation_status: 'passed'
      })
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, data: { application: toCamel(application) } });
  } catch (err) { next(err); }
});

// GET /api/v1/government/applications
router.get('/applications', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: applications, error } = await supabase
      .from('farmer_applications')
      .select('*, scheme:government_schemes(*)')
      .eq('farmer_id', req.user!.id)
      .order('application_date', { ascending: false });

    if (error) throw error;

    res.json({ success: true, data: { applications: toCamel(applications) } });
  } catch (err) { next(err); }
});

// GET /api/v1/government/subsidies
router.get('/subsidies', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: subsidies, error } = await supabase
      .from('subsidy_records')
      .select('*, application:farmer_applications(*, scheme:government_schemes(*))')
      .eq('farmer_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Simulate Financial Summary if empty
    const mockSummary = {
      totalReceived: 45000,
      pendingAmount: 12000,
      activeApplications: 3,
      approvedSchemes: 2
    };

    res.json({ success: true, data: { subsidies: toCamel(subsidies), summary: mockSummary } });
  } catch (err) { next(err); }
});

export default router;
