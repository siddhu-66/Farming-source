"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { CalendarDays, ArrowRight, Sun, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export function CurrentSeasonWidget() {
  const { currentSeason } = useDashboardStore();

  if (!currentSeason) return null;

  return (
    <Card className="h-full overflow-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-100 dark:bg-orange-900/20 rounded-bl-full -mr-10 -mt-10 opacity-50 z-0"></div>
      <div className="absolute top-4 right-4 z-0">
        <Sun className="w-12 h-12 text-orange-400 opacity-20 animate-spin-slow" />
      </div>

      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800 relative z-10">
        <CardTitle className="text-lg flex items-center">
          <CalendarDays className="w-5 h-5 mr-2 text-orange-500" />
          Season: {currentSeason.name}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-4 relative z-10">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-1">Duration</p>
          <div className="flex items-center space-x-2 font-medium">
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{currentSeason.duration.split('→')[0].trim()}</span>
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm">{currentSeason.duration.split('→')[1].trim()}</span>
          </div>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-100 dark:border-orange-900/30 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-orange-800 dark:text-orange-400 flex items-center mb-2">
            <AlertCircle className="w-4 h-4 mr-1.5" />
            Recommended Activity
          </h4>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {currentSeason.recommendedActivity}
          </p>
        </div>

        {/* Progress Bar representation of season */}
        <div className="mt-5">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>45%</span>
          </div>
          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
            <motion.div 
              className="bg-orange-500 h-2 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: "45%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
