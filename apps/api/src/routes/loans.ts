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

// GET /api/v1/loans
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: loans, error: loanErr } = await supabase
      .from('loan_accounts')
      .select('*')
      .eq('farmer_id', req.user!.id);
    
    if (loanErr) throw loanErr;

    res.json({ success: true, data: { loans: toCamel(loans) } });
  } catch (err) { next(err); }
});

// POST /api/v1/loans/apply
router.post('/apply', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { bankName, loanType, principalAmount, durationMonths } = req.body;
    
    // Simulate auto-approval logic
    const interestRate = 7.5; // Fixed agri rate
    
    const { data: loan, error } = await supabase
      .from('loan_accounts')
      .insert({
        farmer_id: req.user!.id,
        loan_number: `LN-${Math.floor(Math.random()*1000000)}`,
        bank_name: bankName,
        loan_type: loanType,
        principal_amount: principalAmount,
        interest_rate: interestRate,
        duration_months: durationMonths,
        remaining_balance: principalAmount,
        disbursement_date: new Date().toISOString().split('T')[0],
        status: 'active'
      })
      .select()
      .single();

    if (error) throw error;
    
    // Generate EMIs for the loan
    const emiAmount = (principalAmount + (principalAmount * (interestRate/100) * (durationMonths/12))) / durationMonths;
    const emiInserts = [];
    let currentDate = new Date();
    
    for (let i = 1; i <= durationMonths; i++) {
      currentDate.setMonth(currentDate.getMonth() + 1);
      emiInserts.push({
        loan_id: loan.id,
        farmer_id: req.user!.id,
        due_date: currentDate.toISOString().split('T')[0],
        amount: parseFloat(emiAmount.toFixed(2)),
        status: 'pending'
      });
    }
    
    await supabase.from('emi_payments').insert(emiInserts);

    res.json({ success: true, data: { loan: toCamel(loan) } });
  } catch (err) { next(err); }
});

export default router;
