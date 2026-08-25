"use client";

import { TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function MarketWidget() {
  const [data, setData] = useState<{ up: string; down: string } | null>(null);

  useEffect(() => {
    // In the future this will fetch from /api/v1/market/summary
    // For now we mock it
    setData({
      up: 'Cotton',
      down: 'Tomato'
    });
  }, []);

  if (!data) return null;

  return (
    <div className="hidden xl:flex items-center space-x-3 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Market Summary">
      <div className="flex items-center text-xs font-medium text-green-600 dark:text-green-500">
        <TrendingUp className="mr-1 h-3.5 w-3.5" />
        {data.up}
      </div>
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
      <div className="flex items-center text-xs font-medium text-red-600 dark:text-red-500">
        <TrendingDown className="mr-1 h-3.5 w-3.5" />
        {data.down}
      </div>
    </div>
  );
}
