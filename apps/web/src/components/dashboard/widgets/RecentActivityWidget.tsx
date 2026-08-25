"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { useDashboardStore } from "@/stores/useDashboardStore";

export function RecentActivityWidget() {
  const { activity: activities, isInitializing: loading } = useDashboardStore();

  if (loading) {
    return <div className="h-full w-full bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse min-h-[300px]" />;
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-blue-500" />
          Recent Activity
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 relative">
        <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-gray-100 dark:bg-gray-800" />
        
        <div className="space-y-6">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative pl-14"
            >
              <div className="absolute left-2.5 top-0 w-7 h-7 rounded-full bg-white dark:bg-gray-950 border-2 border-blue-500 flex items-center justify-center text-sm shadow-sm z-10 -ml-1">
                {activity.icon}
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800">
                <div className="flex justify-between items-start">
                  <h4 className="font-semibold text-sm">{activity.title}</h4>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{activity.time}</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity.description}</p>
              </div>
            </motion.div>
          ))}
          {activities.length === 0 && (
            <p className="text-sm text-muted-foreground text-center">No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}
