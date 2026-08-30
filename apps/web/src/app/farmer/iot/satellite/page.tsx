"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Satellite, ArrowLeft, Image as ImageIcon, CheckCircle2, CloudFog, Loader2, AlertCircle, TrendingUp } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function SatelliteMonitoring() {
  const router = useRouter();
  const [ndvi, setNdvi] = useState<any>(null);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [ndviRes, predictionsRes] = await Promise.all([
        api.get('/api/v1/iot/satellite/ndvi'),
        api.get('/api/v1/iot/predictions')
      ]);

      if (ndviRes.data?.success) {
        setNdvi(ndviRes.data.data);
      }
      if (predictionsRes.data?.success) {
        setPredictions(predictionsRes.data.data.predictions || []);
      }
    } catch (err: any) {
      console.error("Failed to fetch satellite data", err);
      setError(err.response?.data?.message || "Failed to load satellite data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Satellite Monitoring</h1>
            <p className="text-muted-foreground">Normalized Difference Vegetation Index (NDVI) & Crop Health Imagery.</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-red-800 mb-2">Failed to Load Satellite Data</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchData} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Satellite Monitoring</h1>
          <p className="text-muted-foreground">Normalized Difference Vegetation Index (NDVI) & Crop Health Imagery.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Imagery View */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="overflow-hidden border shadow-xl group">
            <div className="h-[500px] w-full bg-slate-200 relative overflow-hidden flex items-center justify-center">
              
              {/* Simulated NDVI Heatmap Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-yellow-400 to-green-800 opacity-60 mix-blend-multiply transition-transform duration-[10s] group-hover:scale-110" />
              
              <div className="absolute inset-0 flex items-center justify-center z-10 text-white/50 font-bold tracking-widest text-2xl uppercase mix-blend-overlay">
                Simulated NDVI Render
              </div>

              {/* Data Overlay */}
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
                <div className="bg-white/90 backdrop-blur px-4 py-2 rounded-xl shadow-lg border">
                  <p className="text-xs font-bold text-slate-500 uppercase mb-1">Index Key</p>
                  <div className="flex items-center gap-2 text-xs font-bold">
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-green-600 rounded-sm"/> Healthy</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-400 rounded-sm"/> Stress</span>
                    <span className="flex items-center gap-1"><div className="w-3 h-3 bg-red-600 rounded-sm"/> Critical</span>
                  </div>
                </div>
                <div className="bg-slate-900/80 backdrop-blur text-white px-4 py-2 rounded-xl text-xs font-medium border border-slate-700">
                  <span className="opacity-70">Capture:</span> {ndvi ? new Date(ndvi.captureDate).toLocaleString() : '--'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Analytics Panel */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Satellite className="w-5 h-5 text-blue-600" /> Imagery Insights
          </h2>

          <Card className="border-t-4 border-t-blue-500">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Avg Health Index</h3>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-4xl font-bold text-slate-800">{ndvi ? ndvi.averageScore.toFixed(2) : '--'}</span>
                    <span className="text-sm font-bold text-emerald-600">Optimal</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                  <CloudFog className="w-6 h-6" />
                </div>
              </div>

              <div className="space-y-4">
                {ndvi?.insights.map((insight: string, idx: number) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700 font-medium">{insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-slate-800">Satellite Source</h3>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-slate-600">Constellation</span>
                <span className="text-sm font-bold text-slate-800">Sentinel-2 (ESA)</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b">
                <span className="text-sm text-slate-600">Resolution</span>
                <span className="text-sm font-bold text-slate-800">{ndvi?.resolution || '10m'} / px</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600">Next Pass</span>
                <span className="text-sm font-bold text-blue-600">Tomorrow, 10:30 AM</span>
              </div>
            </CardContent>
          </Card>

          {predictions.length > 0 && (
            <Card className="border-t-4 border-t-purple-500">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-purple-600" /> AI Predictions
                </h3>
                <div className="space-y-3">
                  {predictions.map((pred) => (
                    <div key={pred.id} className="p-3 bg-slate-50 rounded-xl border">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-sm font-bold text-slate-800 capitalize">
                          {pred.predictionType.replace(/_/g, ' ')}
                        </h4>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          pred.riskLevel === 'low' ? 'bg-green-100 text-green-700' :
                          pred.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {pred.riskLevel}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600">
                        {Object.values(pred.details).join(' • ')}
                      </p>
                      <p className="text-xs text-slate-400 mt-2">
                        Confidence: {(pred.confidenceScore * 100).toFixed(0)}%
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
