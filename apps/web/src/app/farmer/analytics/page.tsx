"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, BarChart3, TrendingUp, TrendingDown, DollarSign, Sprout, ShoppingCart, Calendar, ArrowRight, BrainCircuit, GitCompare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

const QUICK_LINKS = [
  { title: "Executive Scorecard", route: "/farmer/analytics/insights", icon: BrainCircuit, color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Benchmarking", route: "/farmer/analytics/benchmark", icon: GitCompare, color: "text-cyan-600", bg: "bg-cyan-100" },
  { title: "KPIs & Trends", route: "/farmer/analytics/kpis", icon: BarChart3, color: "text-blue-600", bg: "bg-blue-100" },
  { title: "AI Forecasts", route: "/farmer/analytics/forecast", icon: TrendingUp, color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Reports Center", route: "/farmer/analytics/reports", icon: Activity, color: "text-emerald-600", bg: "bg-emerald-100" },
];

export default function AnalyticsDashboard() {
  const router = useRouter();
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/api/v1/analytics/dashboard');
      if (res.data?.success) {
        setDashboard(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-800 to-indigo-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Executive Analytics</h1>
          <p className="text-indigo-200 max-w-lg text-lg">Your high-level agricultural and financial performance.</p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <BarChart3 className="w-64 h-64 -mb-16 -mr-16 text-white" />
        </div>
      </motion.div>

      {/* KPI Overview Grid */}
      {dashboard && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">₹{dashboard.revenue.total.toLocaleString()}</h3>
                  </div>
                  <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
                    <DollarSign className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <TrendingUp className="w-4 h-4" /> {dashboard.revenue.trend} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Total Orders</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard.orders.total}</h3>
                  </div>
                  <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <TrendingUp className="w-4 h-4" /> {dashboard.orders.trend} from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Crop Yield</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">{dashboard.yield.total}</h3>
                  </div>
                  <div className="p-3 bg-amber-100 text-amber-600 rounded-xl">
                    <Sprout className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-emerald-600">
                  <TrendingUp className="w-4 h-4" /> {dashboard.yield.trend} from last season
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase">Avg Selling Price</p>
                    <h3 className="text-2xl font-bold text-slate-800 mt-1">₹35 / kg</h3>
                  </div>
                  <div className="p-3 bg-red-100 text-red-600 rounded-xl">
                    <TrendingDown className="w-5 h-5" />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-sm font-bold text-red-500">
                  <TrendingDown className="w-4 h-4" /> -2.4% from last month
                </div>
              </CardContent>
            </Card>
          </motion.div>

        </div>
      )}

      {/* Deep Dive Links */}
      <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 pt-4">
        <BarChart3 className="w-5 h-5 text-indigo-600" /> Analytical Modules
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_LINKS.map((action, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            transition={{ delay: 0.2 + idx * 0.1 }}
            onClick={() => router.push(action.route)}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-slate-300 group h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{action.title}</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
