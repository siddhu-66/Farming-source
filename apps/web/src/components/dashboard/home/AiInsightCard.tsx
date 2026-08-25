"use client";

import { useUiStore } from "@/stores/uiStore";
import { useEffect, useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, AlertTriangle, Droplet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { motion } from "framer-motion";
import api from "@/lib/api";

interface Insight {
  title: string;
  text: string;
}

export function AiInsightCard() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const { setAiAssistantOpen } = useUiStore();

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const response = await api.get('/ai/recommendations');
        setInsights(response.data.data.recommendations || []);
      } catch (error) {
        console.error("Failed to fetch AI insights", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInsights();
  }, []);

  const getIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('disease') || lower.includes('alert') || lower.includes('risk')) return AlertTriangle;
    if (lower.includes('water') || lower.includes('irrigat')) return Droplet;
    return Lightbulb;
  };

  const getIconColor = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes('disease') || lower.includes('alert')) return "text-red-500 bg-red-100 dark:bg-red-900/30";
    if (lower.includes('water') || lower.includes('irrigat')) return "text-blue-500 bg-blue-100 dark:bg-blue-900/30";
    return "text-purple-500 bg-purple-100 dark:bg-purple-900/30";
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full animate-pulse flex flex-col">
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-800 rounded mb-4" />
        <div className="flex-1 space-y-3">
          <div className="h-16 bg-gray-100 dark:bg-gray-900 rounded-xl" />
          <div className="h-16 bg-gray-100 dark:bg-gray-900 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50/50 to-white dark:from-purple-900/10 dark:to-gray-950 p-6 rounded-2xl shadow-sm border border-purple-100 dark:border-purple-900/30 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">AI Insights</h3>
        </div>
        <span className="text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300 px-2 py-1 rounded-full">
          Personalized
        </span>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {insights.map((insight, index) => {
          const Icon = getIcon(insight.title);
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              key={index}
              className="p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 flex items-start space-x-3"
            >
              <div className={`p-2 rounded-lg shrink-0 ${getIconColor(insight.title)}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{insight.text}</p>
              </div>
            </motion.div>
          );
        })}
        {insights.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No new insights right now.</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-purple-100 dark:border-purple-900/20 grid grid-cols-2 gap-3">
        <Button onClick={() => setAiAssistantOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white w-full">
          Ask AI
        </Button>
        <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50 dark:border-purple-800 dark:text-purple-400 dark:hover:bg-purple-900/20">
          Full Report <ArrowRight className="ml-1.5 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
