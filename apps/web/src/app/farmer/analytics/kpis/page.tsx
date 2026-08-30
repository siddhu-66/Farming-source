"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, LineChart as LineChartIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from "@/lib/api";

export default function KpisTrends() {
  const router = useRouter();
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKpis();
  }, []);

  const fetchKpis = async () => {
    try {
      const res = await api.get('/analytics/kpis');
      if (res.data?.success) {
        setKpis(res.data.data.kpis);
      }
    } catch (err) {
      console.error("Failed to fetch KPIs", err);
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
          <h1 className="text-3xl font-bold text-slate-800">KPIs & Trends</h1>
          <p className="text-muted-foreground">Historical performance and operational metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Revenue Trend */}
        <Card className="border-t-4 border-t-emerald-500 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-emerald-500" /> 30-Day Revenue Trend (₹)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} 
                         tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    formatter={(value: number) => [`₹${value.toFixed(2)}`, 'Revenue']}
                  />
                  <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Yield Trend */}
        <Card className="border-t-4 border-t-amber-500 shadow-lg">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-amber-500" /> 30-Day Crop Yield Trend (Tons)
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={kpis} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} 
                         tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    labelFormatter={(val) => new Date(val).toLocaleDateString()}
                    formatter={(value: number) => [`${value.toFixed(2)} Tons`, 'Yield']}
                  />
                  <Line type="monotone" dataKey="yield" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
