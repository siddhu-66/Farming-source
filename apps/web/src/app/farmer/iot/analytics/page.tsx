"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Brain, ArrowLeft, TrendingUp, AlertCircle, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell
} from 'recharts';
import api from "@/lib/api";

export default function PrecisionAnalytics() {
  const router = useRouter();
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    try {
      const res = await api.get('/api/v1/iot/predictions');
      if (res.data?.success) {
        setPredictions(res.data.data.predictions);
      }
    } catch (err) {
      console.error("Failed to fetch AI predictions", err);
    } finally {
      setLoading(false);
    }
  };

  const riskData = [
    { name: 'North Field', risk: 20 },
    { name: 'South Field', risk: 65 },
    { name: 'East Sector', risk: 15 },
    { name: 'West Sector', risk: 35 },
  ];

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Precision AI Analytics</h1>
          <p className="text-muted-foreground">Predictive crop intelligence powered by edge computing and AI.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Risk Chart */}
        <Card className="border-t-4 border-t-purple-500 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-purple-500" /> Aggregated Disease Risk by Zone
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="risk" radius={[6, 6, 0, 0]}>
                    {riskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.risk > 50 ? '#ef4444' : entry.risk > 30 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* AI Predictions Feed */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Brain className="w-5 h-5 text-blue-600" /> Active Predictions
          </h2>
          
          <div className="space-y-4">
            {predictions.map((pred, idx) => (
              <motion.div key={pred.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`border-l-4 ${pred.riskLevel === 'medium' ? 'border-l-amber-500' : 'border-l-emerald-500'}`}>
                  <CardContent className="p-5 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 capitalize flex items-center gap-2">
                          {pred.predictionType.replace('_', ' ')}
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                            {(pred.confidenceScore * 100).toFixed(0)}% Confidence
                          </span>
                        </h4>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-lg border text-sm text-slate-700 space-y-1">
                      {Object.entries(pred.details).map(([k, v]) => (
                        <div key={k} className="flex justify-between">
                          <span className="capitalize font-medium text-slate-500">{k.replace(/([A-Z])/g, ' $1').trim()}:</span>
                          <span className="font-bold">{v as string}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-slate-400 font-medium text-right pt-1">
                      Generated: {new Date(pred.createdAt).toLocaleString()}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
