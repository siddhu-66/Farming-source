import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';
import { getPaginationParams, buildPaginationResponse } from '../utils/pagination';
import { z } from 'zod';
import { createApiError } from '../middleware';

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

const router = Router();

router.use(authenticate);

// GET /api/reviews/:listingId
router.get('/:listingId', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { listingId } = req.params;
    const { page, limit, skip } = getPaginationParams(req.query);
    const { sortBy = 'newest' } = req.query;

    const sortMap: Record<string, { column: string, ascending: boolean }> = {
      newest: { column: 'created_at', ascending: false },
      highest: { column: 'rating', ascending: false },
      lowest: { column: 'rating', ascending: true },
    };
    const sort = sortMap[sortBy as string] || sortMap.newest;

    const { data: reviews, count: total, error } = await supabase
      .from('reviews')
      .select('*, reviewer:users!reviews_reviewer_id_fkey(name, avatar, is_verified)', { count: 'exact' })
      .eq('reviewee_id', listingId) // Using reviewee_id to store the listing/farmer reference for simplicity here. Actually, we should ideally have a listing_id or target_id on reviews, but sticking to existing schema.
      .order(sort.column, { ascending: sort.ascending })
      .range(skip, skip + limit - 1);

    if (error) throw error;

    res.json({ success: true, data: { reviews: toCamel(reviews), ...buildPaginationResponse(total || 0, page, limit) } });
  } catch (err) { next(err); }
});

export default router;
