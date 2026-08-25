import { Router, Response } from 'express';
import { supabase } from '../config/supabase';
import { authenticate, AuthRequest } from '../middleware';
import { toCamel, toSnake } from '../utils/caseConverter';

const router = Router();
router.use(authenticate);

// Middleware to ensure farmer profile exists and get farmer_id
const getFarmerId = async (userId: string) => {
  const { data, error } = await supabase
    .from('farmers')
    .select('id')
    .eq('user_id', userId)
    .single();
    
  if (error || !data) {
    throw new Error('Farmer profile not found');
  }
  return data.id;
};

// GET /api/v1/farmer/assets
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    const { data: assets, error } = await supabase
      .from('farm_assets')
      .select(`
        *,
        equipment_maintenance (*)
      `)
      .eq('farmer_id', farmerId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    res.json({ success: true, data: toCamel(assets) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/assets
router.post('/', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const payload = toSnake(req.body);
    payload.farmer_id = farmerId;

    const { data, error } = await supabase
      .from('farm_assets')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;
    
    res.status(201).json({ success: true, data: toCamel(data) });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/farmer/assets/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    const payload = toSnake(req.body);

    const { data, error } = await supabase
      .from('farm_assets')
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

// DELETE /api/v1/farmer/assets/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    const { error } = await supabase
      .from('farm_assets')
      .delete()
      .eq('id', req.params.id)
      .eq('farmer_id', farmerId);

    if (error) throw error;
    
    res.json({ success: true, message: 'Asset deleted' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/farmer/assets/:id/maintenance
router.post('/:id/maintenance', async (req: AuthRequest, res: Response): Promise<any> => {
  try {
    const farmerId = await getFarmerId(req.user!.id);
    
    // Ensure asset belongs to farmer
    const { data: asset, error: assetErr } = await supabase
      .from('farm_assets')
      .select('id')
      .eq('id', req.params.id)
      .eq('farmer_id', farmerId)
      .single();
      
    if (assetErr || !asset) {
      return res.status(404).json({ success: false, message: 'Asset not found' });
    }

    const payload = toSnake(req.body);
    payload.asset_id = asset.id;

    const { data, error } = await supabase
      .from('equipment_maintenance')
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
