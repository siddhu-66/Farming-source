import { Router, Response, NextFunction } from 'express';
import { authenticate, AuthRequest, createApiError } from '../middleware';
import { supabase } from '../config/supabase';
import { z } from 'zod';

const router = Router();
router.use(authenticate);

const querySchema = z.object({
  cropName: z.string().trim().min(1).max(100),
  grade: z.string().trim().min(1).max(50).optional(),
  quantity: z.coerce.number().positive().finite().optional(),
});

type ComparableListing = {
  price: number | string | null;
  created_at: string | null;
  quality_grade: string | null;
};

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower);
}

function roundPrice(value: number): number {
  return Math.round(value * 100) / 100;
}

function getTrend(recent: number[], older: number[]): string {
  if (recent.length < 2 || older.length < 2) return 'Insufficient data';
  const recentMedian = percentile(recent, 0.5);
  const olderMedian = percentile(older, 0.5);
  if (olderMedian <= 0) return 'Insufficient data';
  const change = (recentMedian - olderMedian) / olderMedian;
  if (change >= 0.05) return 'Upward';
  if (change <= -0.05) return 'Downward';
  return 'Stable';
}

function getCoverageScore(sampleSize: number, recentCount: number): number {
  const sampleScore = Math.min(60, sampleSize * 3);
  const recencyScore = Math.min(40, recentCount * 4);
  return Math.round(sampleScore + recencyScore);
}

// GET /api/v1/marketplace/price-suggestion
// Uses persisted marketplace listings only. No random/fabricated prices are returned.
router.get('/', async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      next(createApiError(422, parsed.error.issues[0]?.message || 'Invalid price suggestion parameters'));
      return;
    }

    const { cropName, grade } = parsed.data;
    const normalizedCrop = cropName.toLowerCase();

    const { data: gradeListings, error: gradeError } = await supabase
      .from('listings')
      .select('price, created_at, quality_grade')
      .ilike('crop_name', cropName)
      .in('status', ['active', 'auction'])
      .eq('quality_grade', grade || '')
      .not('price', 'is', null)
      .order('created_at', { ascending: false })
      .limit(200);

    if (gradeError) throw gradeError;

    let comparables = (gradeListings || []) as ComparableListing[];
    let pricingBasis: 'crop_and_grade' | 'crop' = 'crop_and_grade';

    // If there are no exact-grade comparables, use the same crop without a
    // synthetic grade multiplier. This keeps the estimate grounded in observed data.
    if (comparables.length === 0) {
      const { data: cropListings, error: cropError } = await supabase
        .from('listings')
        .select('price, created_at, quality_grade')
        .ilike('crop_name', cropName)
        .in('status', ['active', 'auction'])
        .not('price', 'is', null)
        .order('created_at', { ascending: false })
        .limit(200);

      if (cropError) throw cropError;
      comparables = (cropListings || []) as ComparableListing[];
      pricingBasis = 'crop';
    }

    const numericPrices = comparables
      .map((listing) => typeof listing.price === 'number' ? listing.price : Number(listing.price))
      .filter((price) => Number.isFinite(price) && price > 0);

    if (numericPrices.length === 0) {
      throw createApiError(404, `No current market price data is available for ${normalizedCrop}`);
    }

    const cutoff = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentPrices: number[] = [];
    const olderPrices: number[] = [];

    comparables.forEach((listing) => {
      const price = typeof listing.price === 'number' ? listing.price : Number(listing.price);
      const timestamp = listing.created_at ? Date.parse(listing.created_at) : NaN;
      if (!Number.isFinite(price) || price <= 0) return;
      if (Number.isFinite(timestamp) && timestamp >= cutoff) recentPrices.push(price);
      else if (Number.isFinite(timestamp)) olderPrices.push(price);
    });

    const suggestedPrice = roundPrice(percentile(numericPrices, 0.5));
    const minAcceptablePrice = roundPrice(percentile(numericPrices, 0.25));
    const premiumOpportunity = roundPrice(percentile(numericPrices, 0.75));

    res.json({
      success: true,
      data: {
        suggestedPrice,
        minAcceptablePrice,
        premiumOpportunity,
        marketTrend: getTrend(recentPrices, olderPrices),
        confidenceScore: getCoverageScore(numericPrices.length, recentPrices.length),
        sampleSize: numericPrices.length,
        pricingBasis,
        dataAsOf: new Date().toISOString(),
        requestedGrade: grade || null,
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
