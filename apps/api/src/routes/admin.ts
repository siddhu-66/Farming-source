import { Router, Response, NextFunction } from 'express';
import { authenticate, authorizeRole, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { createApiError } from '../middleware';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import { z } from 'zod';
import bcrypt from 'bcryptjs';

const router = Router();

function mapKeys(obj: any): any {
  if (Array.isArray(obj)) return obj.map(mapKeys);
  if (obj !== null && typeof obj === 'object') {
    const newObj: any = {};
    for (const key in obj) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = mapKeys(obj[key]);
    }
    return newObj;
  }
  return obj;
}

router.use(authenticate, authorizeRole('admin'));

// ============================================
// USER MANAGEMENT
// ============================================

// GET /api/admin/users
router.get('/users', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { role, search, isActive, isVerified } = req.query;

    let query = supabase.from('users').select('*', { count: 'exact' });

    if (role) query = query.eq('role', role);
    if (isActive !== undefined) query = query.eq('status', isActive === 'true' ? 'active' : 'inactive');
    if (isVerified !== undefined) query = query.eq('verified', isVerified === 'true');
    if (search) {
      query = query.or(`full_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: users, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: mapKeys({ users, ...buildPaginationResponse(total || 0, page, limit) }) });
  } catch (err) { next(err); }
});

// GET /api/admin/users/:id
router.get('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: user, error } = await supabase.from('users').select('*').eq('id', req.params.id).single();
    if (error || !user) throw createApiError(404, 'User not found');
    res.json({ success: true, data: mapKeys({ user }) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/users/:id/verify
router.patch('/users/:id/verify', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: user, error } = await supabase.from('users').update({ verified: true }).eq('id', req.params.id).select().single();
    if (error || !user) throw createApiError(404, 'User not found');

    await supabase.from('audit_logs').insert([{
      user_id: req.user!.id,
      action: 'verify_user',
      entity: 'User',
      entity_id: req.params.id,
      metadata: { ip_address: req.ip || 'unknown', user_agent: req.headers['user-agent'] },
    }]);

    res.json({ success: true, message: 'User verified', data: mapKeys({ user }) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/auth/block-user/:id
router.patch('/auth/block-user/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reason } = req.body;
    const { data: user, error } = await supabase.from('users').update({ status: 'suspended' }).eq('id', req.params.id).select().single();
    if (error || !user) throw createApiError(404, 'User not found');

    await supabase.from('audit_logs').insert([{
      user_id: req.user!.id,
      action: 'suspend_user',
      entity: 'User',
      entity_id: req.params.id,
      metadata: { reason, ip_address: req.ip || 'unknown', user_agent: req.headers['user-agent'] },
    }]);

    res.json({ success: true, message: 'User blocked', data: mapKeys({ user }) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/auth/unblock-user/:id
router.patch('/auth/unblock-user/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: user, error } = await supabase.from('users').update({ status: 'active' }).eq('id', req.params.id).select().single();
    if (error || !user) throw createApiError(404, 'User not found');
    res.json({ success: true, message: 'User unblocked', data: mapKeys({ user }) });
  } catch (err) { next(err); }
});

// GET /api/admin/auth/sessions
router.get('/auth/sessions', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: sessions, error } = await supabase.from('sessions').select('*').order('created_at', { ascending: false });
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ sessions }) });
  } catch (err) { next(err); }
});

// GET /api/admin/login-history
router.get('/login-history', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: history, error } = await supabase.from('login_history').select('*').order('created_at', { ascending: false });
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ history }) });
  } catch (err) { next(err); }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.from('users').delete().eq('id', req.params.id);
    if (error) throw createApiError(500, error.message);
    
    await supabase.from('audit_logs').insert([{
      user_id: req.user!.id,
      action: 'delete_user',
      entity: 'User',
      entity_id: req.params.id,
      metadata: { ip_address: req.ip || 'unknown', user_agent: req.headers['user-agent'] },
    }]);
    res.json({ success: true, message: 'User deleted' });
  } catch (err) { next(err); }
});

// ============================================
// MARKETPLACE MONITORING
// ============================================

// GET /api/admin/marketplace
router.get('/marketplace', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page, limit, skip } = getPaginationParams(req.query);
    const { status, type } = req.query;
    
    let query = supabase.from('listings').select('*, seller:users!listings_seller_id_fkey(name:full_name, email, role)', { count: 'exact' });
    if (status) query = query.eq('status', status);
    if (type) query = query.eq('listing_type', type);
    query = query.order('created_at', { ascending: false }).range(skip, skip + limit - 1);

    const { data: listings, count: total, error } = await query;
    if (error) throw createApiError(500, error.message);

    res.json({ success: true, data: mapKeys({ listings, ...buildPaginationResponse(total || 0, page, limit) }) });
  } catch (err) { next(err); }
});

// PATCH /api/admin/marketplace/:id/deactivate
router.patch('/marketplace/:id/deactivate', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: listing, error } = await supabase.from('listings').update({ status: 'cancelled' }).eq('id', req.params.id).select().single();
    if (error || !listing) throw createApiError(404, 'Listing not found');
    res.json({ success: true, message: 'Listing deactivated' });
  } catch (err) { next(err); }
});

// ============================================
// PLATFORM ANALYTICS
// ============================================

// GET /api/admin/analytics
router.get('/analytics', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      { count: totalUsers },
      { count: totalListings },
      { count: activeListings },
      { count: totalOrders },
      { count: completedOrders },
      { data: recentOrdersData },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('orders').select('*', { count: 'exact', head: true }),
      supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'completed'),
      supabase.from('orders').select('*, farmer_id:users!orders_farmer_id_fkey(name:full_name), buyer_id:users!orders_buyer_id_fkey(name:full_name)').order('created_at', { ascending: false }).limit(10),
    ]);

    res.json({
      success: true,
      data: mapKeys({
        overview: {
          totalUsers: totalUsers || 0,
          totalListings: totalListings || 0,
          activeListings: activeListings || 0,
          totalOrders: totalOrders || 0,
          completedOrders: completedOrders || 0,
          totalRevenue: 0, // Simplified for now since Supabase needs RPC for aggregation
        },
        usersByRole: [], // Simplified
        userGrowth: [], // Simplified
        recentOrders: recentOrdersData || [],
      }),
    });
  } catch (err) { next(err); }
});

// GET /api/admin/dashboard (Mission Control)
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      { count: totalUsers },
      { count: activeUsers },
      { count: pendingVerifications },
      { count: activeListings },
      { count: ordersToday },
    ] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('users').select('*', { count: 'exact', head: true }).eq('verified', false).eq('status', 'active'),
      supabase.from('listings').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    ]);

    const systemHealth = { status: 'operational', uptime: process.uptime(), memory: process.memoryUsage() };

    res.json({
      success: true,
      data: mapKeys({
        stats: { 
          totalUsers: totalUsers || 0, 
          activeUsers: activeUsers || 0, 
          pendingVerifications: pendingVerifications || 0, 
          activeListings: activeListings || 0, 
          ordersToday: ordersToday || 0 
        },
        systemHealth,
      }),
    });
  } catch (err) { next(err); }
});

// ============================================
// GOVERNMENT SCHEMES MANAGEMENT
// ============================================

// GET /api/admin/schemes
router.get('/schemes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: schemes, error } = await supabase.from('government_schemes').select('*').order('created_at', { ascending: false });
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, data: mapKeys({ schemes }) });
  } catch (err) { next(err); }
});

// POST /api/admin/schemes
router.post('/schemes', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const schema = z.object({
      title: z.string().min(5),
      description: z.string().min(20),
      ministry: z.string(),
      eligibility: z.string(),
      benefits: z.string(),
      applicationUrl: z.string().url(),
      deadline: z.string().optional(),
      targetRoles: z.array(z.enum(['farmer', 'buyer', 'transport', 'industry'])),
      state: z.string().optional(),
      category: z.enum(['subsidy', 'loan', 'insurance', 'training', 'equipment', 'other']),
    });
    const data = schema.parse(req.body);
    const { data: scheme, error } = await supabase.from('government_schemes').insert([{ 
      title: data.title,
      description: data.description,
      ministry: data.ministry,
      eligibility: data.eligibility,
      benefits: data.benefits,
      application_url: data.applicationUrl,
      deadline: data.deadline,
      target_roles: data.targetRoles,
      state: data.state,
      category: data.category,
      created_by: req.user!.id 
    }]).select().single();
    if (error) throw createApiError(500, error.message);
    res.status(201).json({ success: true, message: 'Scheme created', data: mapKeys({ scheme }) });
  } catch (err) {
    if (err instanceof z.ZodError) next(createApiError(422, err.errors[0].message));
    else next(err);
  }
});

// DELETE /api/admin/schemes/:id
router.delete('/schemes/:id', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { error } = await supabase.from('government_schemes').delete().eq('id', req.params.id);
    if (error) throw createApiError(500, error.message);
    res.json({ success: true, message: 'Scheme deleted' });
  } catch (err) { next(err); }
});

// ============================================
// AUDIT LOGS
// ============================================
// SECURITY EVENTS (Admin)
// ============================================

import { getAdminEvents, acknowledgeEvent, resolveEvent } from '../controllers/security.controller';

// GET /api/admin/security/events
router.get('/security/events', getAdminEvents);

// PATCH /api/admin/security/events/:id/acknowledge
router.patch('/security/events/:id/acknowledge', acknowledgeEvent);

// PATCH /api/admin/security/events/:id/resolve
router.patch('/security/events/:id/resolve', resolveEvent);

// ============================================
// ADMIN CREATE (for seeding first admin)
// ============================================

// POST /api/admin/create-admin (one-time setup endpoint, remove after use)
router.post('/create-admin', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { secretKey } = req.body;
    if (secretKey !== process.env.ADMIN_SETUP_KEY) throw createApiError(403, 'Invalid setup key');
    
    const schema = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string(),
      password: z.string().min(8),
    });
    const data = schema.parse(req.body);
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const { data: admin, error } = await supabase.from('users').insert([{ 
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      password_hash: hashedPassword,
      role: 'admin', 
      verified: true, 
      status: 'active' 
    }]).select().single();
    
    if (error) throw createApiError(500, error.message);
    res.status(201).json({ success: true, message: 'Admin created', data: mapKeys({ admin }) });
  } catch (err) { next(err); }
});

export default router;
