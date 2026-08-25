"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Minus, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

interface StatItem {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string;
  icon: string;
  route: string;
}

export function HeroStatistics() {
  const [stats, setStats] = useState<StatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/dashboard/stats');
        setStats(response.data.data || []);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse" />
        ))}
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    return <Minus className="h-4 w-4 text-gray-500" />;
  };

  const getTrendClass = (trend: string) => {
    if (trend === 'up') return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20";
    if (trend === 'down') return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20";
    return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white dark:bg-gray-950 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col justify-between group cursor-pointer hover:border-green-200 dark:hover:border-green-900/50 transition-colors"
          onClick={() => router.push(stat.route)}
        >
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{stat.icon}</div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{stat.value}</h3>
              </div>
            </div>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTrendClass(stat.trend)}`}>
              {getTrendIcon(stat.trend)}
              <span className="ml-1">{stat.change}</span>
            </div>
          </div>
          
          <div className="flex items-center justify-between mt-2 pt-3 border-t border-gray-50 dark:border-gray-900/50">
            <p className="text-xs text-muted-foreground">Updated {stat.lastUpdated}</p>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-4 w-4 text-green-600" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
