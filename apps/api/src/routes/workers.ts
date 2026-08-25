import { Router, Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest } from '../middleware';
import { toCamel, toSnake } from '../utils/caseConverter';

const router = Router();
router.use(authenticate);

const getFarmerId = async (userId: string) => {
  const { data, error } = await supabase
    .from('farmers')
    .select('id')
    .eq('user_id', userId)
    .single();
  if (error || !data) throw new Error('Farmer profile not found');
  return data.id;
};

// GET /api/v1/farmer/workers
router.get('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const { data, error } = await supabase
      .from('farm_workers')
      .select(`
        *,
        attendance (*)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/workers
router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const payload = toSnake(req.body);
    payload.farmer_id = farmerId;

    const { data, error } = await supabase
      .from('farm_workers')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/farmer/workers/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const payload = toSnake(req.body);

    const { data, error } = await supabase
      .from('farm_workers')
      .update(payload)
      .eq('id', req.params.id)
      .eq('farmer_id', farmerId)
      .select()
      .single();

    if (error) throw error;
    res.json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/farmer/workers/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    const { error } = await supabase
      .from('farm_workers')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', farmerId);

    if (error) throw error;
    res.json({ success: true, message: 'Worker deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/workers/:id/attendance
router.post('/:id/attendance', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    // Ensure worker belongs to farmer
    const { data: worker, error: workerErr } = await supabase
      .from('farm_workers')
      .select('id')
      .eq('id', req.params.id)
      .eq('farmer_id', farmerId)
      .single();
      
    if (workerErr || !worker) {
      return res.status(404).json({ success: false, message: 'Worker not found' });
    }

    const payload = toSnake(req.body);
    payload.worker_id = worker.id;

    const { data, error } = await supabase
      .from('attendance')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    res.status(201).json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
