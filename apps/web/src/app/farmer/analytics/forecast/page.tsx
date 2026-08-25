"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer
} from 'recharts';
import api from "@/lib/api";

export default function Forecasts() {
  const router = useRouter();
  const [forecasts, setForecasts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchForecasts();
  }, []);

  const fetchForecasts = async () => {
    try {
      const res = await api.get('/api/v1/analytics/forecast');
      if (res.data?.success) {
        setForecasts(res.data.data.forecasts);
      }
    } catch (err) {
      console.error("Failed to fetch Forecasts", err);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-3xl font-bold text-slate-800">AI Forecasts</h1>
          <p className="text-muted-foreground">30-Day predictive intelligence for revenue and yields.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Revenue Forecast Area Chart */}
        <Card className="border-t-4 border-t-indigo-500 shadow-xl overflow-hidden relative">
          <div className="absolute right-0 top-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full -mr-8 -mt-8" />
          <CardContent className="p-6 relative z-10">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-500" /> 30-Day Revenue Projection (₹)
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecasts} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="targetDate" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} 
                         tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    formatter={(value: number, name: string, props: any) => [
                      <>₹{value.toFixed(2)} <span className="text-[10px] text-slate-400 block">Confidence: {(props.payload.confidenceScore * 100).toFixed(0)}%</span></>, 
                      'Predicted Revenue'
                    ]}
                  />
                  <Area type="monotone" dataKey="predictedRevenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
