import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { createApiError } from '../middleware';
import { supabase } from '../config/supabase';

const router = Router();
router.use(authenticate);

const getWallet = async (userId: string) => {
  const { data, error } = await supabase.from('wallets').upsert({ user_id: userId }, { onConflict: 'user_id', ignoreDuplicates: true }).select('*').single();
  if (error) {
    const fallback = await supabase.from('wallets').select('*').eq('user_id', userId).single();
    if (fallback.error) throw fallback.error;
    return fallback.data;
  }
  return data;
};

router.get('/', async (req: AuthRequest,res: Response,next: NextFunction)=>{ try { const wallet=await getWallet(req.user!.id); res.json({success:true,data:wallet}); } catch(e){next(e);} });
router.get('/transactions', async (req: AuthRequest,res: Response,next: NextFunction)=>{ try { const wallet=await getWallet(req.user!.id); const {data,error}=await supabase.from('wallet_transactions').select('*').eq('wallet_id',wallet.id).order('created_at',{ascending:false}).limit(100); if(error) throw error; res.json({success:true,data:{transactions:data||[]}}); } catch(e){next(e);} });
router.post('/withdraw', async (req: AuthRequest,res: Response,next: NextFunction)=>{ try { const amount=Number(req.body.amount); const bankId=typeof req.body.bankId==='string'?req.body.bankId.trim():''; if(!Number.isFinite(amount)||amount<=0) throw createApiError(400,'A valid positive amount is required'); if(!bankId) throw createApiError(400,'bankId is required'); const wallet=await getWallet(req.user!.id); if(Number(wallet.available_balance)<amount) throw createApiError(400,'Insufficient wallet balance'); const {data,error}=await supabase.from('withdrawal_requests').insert({wallet_id:wallet.id,amount,bank_id:bankId}).select().single(); if(error) throw error; res.status(201).json({success:true,data:{withdrawal:data}}); } catch(e){next(e);} });
export default router;
