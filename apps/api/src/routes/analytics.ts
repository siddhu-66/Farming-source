import { Router, Request, Response, NextFunction } from 'express';
import { authenticate, AuthRequest } from '../middleware';
import { supabase } from '../config/supabase';

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

// GET /api/v1/analytics/dashboard
router.get('/dashboard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    // Return high level aggregated mock data for the dashboard
    const dashboardData = {
      revenue: { total: 45000, trend: '+12.5%' },
      orders: { total: 124, trend: '+5.2%' },
      yield: { total: '8.2 Tons', trend: '+1.1%' },
      activeUsers: { total: 42, trend: '+3.0%' }
    };
    res.json({ success: true, data: dashboardData });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/kpis
router.get('/kpis', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: kpis, error } = await supabase
      .from('analytics_kpis')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('kpi_date', { ascending: true });
      
    if (error) throw error;
    
    // If no KPIs, generate mock data for charting
    if (!kpis || kpis.length === 0) {
      const mockKpis = [];
      for(let i=30; i>=0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        mockKpis.push({
          date: d.toISOString().split('T')[0],
          revenue: 1000 + Math.random() * 500,
          yield: 50 + Math.random() * 20
        });
      }
      res.json({ success: true, data: { kpis: mockKpis } });
      return;
    }

    res.json({ success: true, data: { kpis: toCamel(kpis) } });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/forecast
router.get('/forecast', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: forecasts, error } = await supabase
      .from('forecast_models')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('target_date', { ascending: true });
      
    if (error) throw error;
    
    if (!forecasts || forecasts.length === 0) {
      const mockForecasts = [];
      for(let i=1; i<=30; i++) {
        const d = new Date();
        d.setDate(d.getDate() + i);
        mockForecasts.push({
          targetDate: d.toISOString().split('T')[0],
          predictedRevenue: 1200 + Math.random() * 600,
          confidenceScore: 0.85
        });
      }
      res.json({ success: true, data: { forecasts: mockForecasts } });
      return;
    }

    res.json({ success: true, data: { forecasts: toCamel(forecasts) } });
  } catch (err) { next(err); }
});

// POST /api/v1/analytics/export
router.post('/export', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reportType, format } = req.body;
    
    // Simulating report generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const mockUrl = `https://storage.agriassist.in/exports/${req.user!.id}/${reportType}_${Date.now()}.${format}`;
    
    const { data: report, error } = await supabase.from('analytics_reports').insert({
      user_id: req.user!.id,
      report_type: reportType,
      format,
      file_url: mockUrl
    }).select().single();
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Report generated successfully', data: { report: toCamel(report) } });
  } catch (err) { next(err); }
});

// POST /api/v1/analytics/schedule
router.post('/schedule', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { reportType, frequency, channels } = req.body;
    
    const { data: schedule, error } = await supabase.from('scheduled_reports').insert({
      user_id: req.user!.id,
      report_type: reportType,
      frequency,
      delivery_channels: channels
    }).select().single();
    
    if (error) throw error;
    
    res.json({ success: true, message: 'Report scheduled successfully', data: { schedule: toCamel(schedule) } });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/insights
router.get('/insights', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: insights, error } = await supabase
      .from('ai_business_insights')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (!insights || insights.length === 0) {
      const mockInsights = [
        {
          id: 'insight_1',
          insightType: 'risk',
          title: 'High Water Usage Anomaly',
          description: 'North Field irrigation exceeded historical averages by 22% over the last 3 days. Recommend checking soil moisture sensor calibration.',
          priority: 'high',
          createdAt: new Date().toISOString()
        },
        {
          id: 'insight_2',
          insightType: 'opportunity',
          title: 'Fertilizer Optimization',
          description: 'Based on current NPK levels, you can reduce nitrogen application by 15% in the South Sector without impacting predicted yield.',
          priority: 'medium',
          createdAt: new Date().toISOString()
        }
      ];
      res.json({ success: true, data: { insights: mockInsights } });
      return;
    }
    
    res.json({ success: true, data: { insights: toCamel(insights) } });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/benchmark
router.get('/benchmark', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { data: benchmarks, error } = await supabase
      .from('benchmark_results')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });
      
    if (error) throw error;
    
    if (!benchmarks || benchmarks.length === 0) {
      const mockBenchmarks = [
        { metricName: 'Yield (Tons/Acre)', userValue: 4.2, regionalAverage: 3.8, topPercentile: 4.8 },
        { metricName: 'Water (L/Kg)', userValue: 85, regionalAverage: 110, topPercentile: 75 },
        { metricName: 'Revenue (₹/Acre)', userValue: 125000, regionalAverage: 95000, topPercentile: 140000 }
      ];
      res.json({ success: true, data: { benchmarks: mockBenchmarks } });
      return;
    }
    
    res.json({ success: true, data: { benchmarks: toCamel(benchmarks) } });
  } catch (err) { next(err); }
});

// GET /api/v1/analytics/scorecard
router.get('/scorecard', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const mockScorecard = {
      businessHealth: 92,
      productivityIndex: 88,
      sustainabilityIndex: 95,
      profitabilityScore: 85,
      aiConfidenceScore: 94
    };
    res.json({ success: true, data: { scorecard: mockScorecard } });
  } catch (err) { next(err); }
});

export default router;
