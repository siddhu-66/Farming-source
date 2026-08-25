"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, BrainCircuit, AlertTriangle, TrendingUp, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function InsightsAndScorecard() {
  const router = useRouter();
  const [insights, setInsights] = useState<any[]>([]);
  const [scorecard, setScorecard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [insightsRes, scorecardRes] = await Promise.all([
        api.get('/api/v1/analytics/insights'),
        api.get('/api/v1/analytics/scorecard')
      ]);
      if (insightsRes.data?.success) setInsights(insightsRes.data.data.insights);
      if (scorecardRes.data?.success) setScorecard(scorecardRes.data.data.scorecard);
    } catch (err) {
      console.error("Failed to fetch Insights/Scorecard", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex h-[50vh] items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>;
  }

  const getIcon = (type: string) => {
    switch(type) {
      case 'risk': return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'opportunity': return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Advanced AI Insights</h1>
          <p className="text-muted-foreground">Executive scorecard and automated opportunity detection.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Executive Scorecard */}
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-purple-600" /> Executive Scorecard
          </h2>
          
          {scorecard && (
            <Card className="border-t-4 border-t-purple-500 shadow-xl overflow-hidden relative">
              <div className="absolute right-0 top-0 w-32 h-32 bg-purple-500/10 rounded-bl-full -mr-8 -mt-8" />
              <CardContent className="p-6 relative z-10 space-y-6">
                
                <div className="text-center pb-6 border-b">
                  <p className="text-sm font-bold text-slate-500 uppercase">Overall Business Health</p>
                  <div className="text-6xl font-black text-purple-600 mt-2">{scorecard.businessHealth}</div>
                  <p className="text-xs text-slate-400 mt-2">Score out of 100</p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Productivity Index</span>
                    <span className="font-bold text-slate-800">{scorecard.productivityIndex}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Sustainability Index</span>
                    <span className="font-bold text-emerald-600">{scorecard.sustainabilityIndex}/100</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-600">Profitability Score</span>
                    <span className="font-bold text-blue-600">{scorecard.profitabilityScore}/100</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-dashed">
                    <span className="text-xs font-bold text-slate-400 uppercase">AI Confidence Score</span>
                    <span className="text-xs font-bold text-purple-500">{scorecard.aiConfidenceScore}%</span>
                  </div>
                </div>

              </CardContent>
            </Card>
          )}
        </div>

        {/* AI Insight Feed */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800">Actionable Opportunities & Risks</h2>
          
          <div className="space-y-4">
            {insights.map((insight, idx) => (
              <motion.div key={insight.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                <Card className={`border-l-4 ${insight.insightType === 'risk' ? 'border-l-red-500' : 'border-l-emerald-500'}`}>
                  <CardContent className="p-5 flex gap-4 items-start">
                    <div className="p-2 bg-slate-50 rounded-xl mt-1">
                      {getIcon(insight.insightType)}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-slate-800">{insight.title}</h4>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${insight.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>
                          {insight.priority} Priority
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {insight.description}
                      </p>
                      <div className="flex justify-between items-center pt-2">
                        <p className="text-xs text-slate-400 font-medium">
                          Detected: {new Date(insight.createdAt).toLocaleString()}
                        </p>
                        <Button variant="ghost" size="sm" className="text-indigo-600 font-bold hover:bg-indigo-50">
                          Take Action &rarr;
                        </Button>
                      </div>
                    </div>
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
