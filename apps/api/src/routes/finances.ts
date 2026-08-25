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

// GET /api/v1/finances/emi
router.get('/emi', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: emis, error } = await supabase
      .from('emi_payments')
      .select('*, loan:loan_accounts(*)')
      .eq('farmer_id', req.user!.id)
      .order('due_date', { ascending: true });
    
    if (error) throw error;

    res.json({ success: true, data: { emis: toCamel(emis) } });
  } catch (err) { next(err); }
});

// POST /api/v1/finances/emi/pay
router.post('/emi/pay', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { emiId } = req.body;
    
    const { data: emi, error: fetchErr } = await supabase
      .from('emi_payments')
      .select('*')
      .eq('id', emiId)
      .single();
    
    if (fetchErr || !emi) throw createApiError(404, 'EMI not found');
    if (emi.status === 'paid') throw createApiError(400, 'EMI already paid');

    // Mark EMI as paid
    const { error: updateErr } = await supabase
      .from('emi_payments')
      .update({ status: 'paid', paid_date: new Date().toISOString().split('T')[0] })
      .eq('id', emiId);
    
    if (updateErr) throw updateErr;

    // Log transaction
    await supabase.from('financial_transactions').insert({
      farmer_id: req.user!.id,
      transaction_type: 'emi_payment',
      amount: emi.amount,
      reference_id: emi.id,
      status: 'completed'
    });

    // Update remaining loan balance
    const { data: loan } = await supabase.from('loan_accounts').select('*').eq('id', emi.loan_id).single();
    if (loan) {
      const newBalance = Math.max(0, Number(loan.remaining_balance) - (Number(emi.principal_component) || Number(emi.amount) * 0.8));
      await supabase.from('loan_accounts').update({ remaining_balance: newBalance }).eq('id', loan.id);
    }

    res.json({ success: true, message: 'EMI paid successfully' });
  } catch (err) { next(err); }
});

// GET /api/v1/finances/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: txs, error } = await supabase
      .from('financial_transactions')
      .select('*')
      .eq('farmer_id', req.user!.id)
      .order('transaction_date', { ascending: false });
    
    if (error) throw error;

    res.json({ success: true, data: { transactions: toCamel(txs) } });
  } catch (err) { next(err); }
});

export default router;
