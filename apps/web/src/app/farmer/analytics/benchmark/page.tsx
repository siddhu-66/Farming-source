"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, GitCompare, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from "@/lib/api";

export default function Benchmarking() {
  const router = useRouter();
  const [benchmarks, setBenchmarks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBenchmarks();
  }, []);

  const fetchBenchmarks = async () => {
    try {
      const res = await api.get('/analytics/benchmark');
      if (res.data?.success) {
        setBenchmarks(res.data.data.benchmarks);
      }
    } catch (err) {
      console.error("Failed to fetch Benchmarks", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Regional Benchmarking</h1>
          <p className="text-muted-foreground">Compare your farm's performance against regional averages and top percentiles.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Benchmarking Bar Chart */}
        <Card className="border-t-4 border-t-blue-500 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-blue-500" /> Performance Comparison
            </h3>
            <div className="h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={benchmarks} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="metricName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: 'transparent'}}
                  />
                  <Legend wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="userValue" name="Your Farm" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="regionalAverage" name="Regional Average" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="topPercentile" name="Top 10% Farms" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Actionable Recommendations based on Benchmarks */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benchmarks.map((b, idx) => (
            <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
              <Card className="h-full">
                <CardContent className="p-6 flex flex-col justify-between h-full">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-bold text-slate-800">{b.metricName}</h4>
                      {b.userValue >= b.topPercentile && <Trophy className="w-5 h-5 text-amber-500" />}
                    </div>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">You:</span>
                        <span className="font-bold text-blue-600">{b.userValue}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Avg:</span>
                        <span className="font-bold text-slate-800">{b.regionalAverage}</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">Top:</span>
                        <span className="font-bold text-emerald-600">{b.topPercentile}</span>
                      </div>
                    </div>
                  </div>
                  
                  {b.userValue < b.regionalAverage ? (
                    <div className="p-3 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100">
                      Below Average. Click here for AI strategies to improve.
                    </div>
                  ) : b.userValue >= b.topPercentile ? (
                    <div className="p-3 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg border border-amber-100">
                      Top Performer! Maintain current practices.
                    </div>
                  ) : (
                    <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100">
                      Above Average. Approaching top 10% bracket.
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
}
