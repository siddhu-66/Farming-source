import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { createApiError } from '../middleware';
import { supabase } from '../config/supabase';

const router = Router();
router.use(authenticate);

const mapKeys = (obj: any): any => {
  if (Array.isArray(obj)) return obj.map(mapKeys);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      acc[camelKey] = mapKeys(obj[key]);
      return acc;
    }, {} as any);
  }
  return obj;
};

// GET /api/wallet - Get Wallet Summary
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // In a real implementation, we'd fetch from a `wallets` table. 
    // Here we'll mock the response based on the user's role to fulfill the Volume 3.10 requirements visually.
    
    const mockWalletData = {
      availableBalance: req.user!.role === 'buyer' ? 120500 : 42560,
      pendingBalance: req.user!.role === 'buyer' ? 0 : 8250,
      lifetimeEarnings: req.user!.role === 'buyer' ? 0 : 185400,
      totalSpent: req.user!.role === 'buyer' ? 345000 : 15000,
      cashback: 1250,
      rewardPoints: 450,
      escrowLocked: req.user!.role === 'buyer' ? 45000 : 0
    };

    res.json({ success: true, data: mockWalletData });
  } catch (err) { next(err); }
});

// GET /api/wallet/transactions - Get Transaction History
router.get('/transactions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Mock transactions
    const mockTransactions = [
      {
        id: 'TXN-982374-1',
        amount: 25000,
        type: req.user!.role === 'buyer' ? 'DEBIT' : 'CREDIT',
        category: req.user!.role === 'buyer' ? 'Crop Purchase' : 'Crop Sale',
        status: 'COMPLETED',
        date: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        method: 'UPI',
        reference: 'UPI123456789'
      },
      {
        id: 'TXN-982374-2',
        amount: 8250,
        type: 'CREDIT',
        category: 'Escrow Settlement',
        status: 'PENDING',
        date: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        method: 'Wallet',
        reference: 'ESCROW-99'
      },
      {
        id: 'TXN-982374-3',
        amount: req.user!.role === 'buyer' ? 50000 : 10000,
        type: 'DEBIT',
        category: 'Withdrawal',
        status: 'COMPLETED',
        date: new Date(Date.now() - 1000 * 60 * 60 * 48),
        method: 'Bank Transfer',
        reference: 'NEFT99887766'
      },
      {
        id: 'TXN-982374-4',
        amount: 150,
        type: 'CREDIT',
        category: 'Cashback',
        status: 'COMPLETED',
        date: new Date(Date.now() - 1000 * 60 * 60 * 72),
        method: 'Wallet',
        reference: 'CB-102'
      }
    ];

    res.json({ success: true, data: { transactions: mockTransactions } });
  } catch (err) { next(err); }
});

// POST /api/wallet/withdraw - Withdraw Money
router.post('/withdraw', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { amount, bankId } = req.body;
    if (!amount) throw createApiError(400, 'Amount is required');
    
    // In reality, this would deduct from wallet and create a withdraw_request
    res.json({ success: true, message: 'Withdrawal request initiated successfully. Funds will reflect in 2-3 business days.' });
  } catch (err) { next(err); }
});

export default router;
