import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';

const router = Router();
router.use(authenticate);

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

// GET /api/v1/insurance
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: policies, error: polErr } = await supabase
      .from('insurance_policies')
      .select('*')
      .eq('farmer_id', req.user!.id);
    
    if (polErr) throw polErr;

    const { data: claims, error: claimErr } = await supabase
      .from('insurance_claims')
      .select('*, policy:insurance_policies(*)')
      .eq('farmer_id', req.user!.id);
    
    if (claimErr) throw claimErr;

    res.json({ success: true, data: { policies: toCamel(policies), claims: toCamel(claims) } });
  } catch (err) { next(err); }
});

// POST /api/v1/insurance/claims
router.post('/claims', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { policyId, incidentDate, damageDescription, requestedAmount, evidenceDocuments } = req.body;
    
    // Auto-calculate AI risk score based on requested amount (mock)
    const aiRiskScore = requestedAmount > 50000 ? 80 : 20;
    
    const { data: claim, error } = await supabase
      .from('insurance_claims')
      .insert({
        farmer_id: req.user!.id,
        policy_id: policyId,
        incident_date: incidentDate,
        damage_description: damageDescription,
        requested_amount: requestedAmount,
        evidence_documents: evidenceDocuments,
        ai_risk_score: aiRiskScore,
        status: 'submitted'
      })
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: { claim: toCamel(claim) } });
  } catch (err) { next(err); }
});

export default router;
