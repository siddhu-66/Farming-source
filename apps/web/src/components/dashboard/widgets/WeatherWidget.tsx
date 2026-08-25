"use client";

import { CloudRain, Wind } from "lucide-react";
import { useEffect, useState } from "react";

export function WeatherWidget() {
  const [data, setData] = useState<{ temp: number; condition: string; rain: number; wind: number } | null>(null);

  useEffect(() => {
    // In the future this will fetch from /api/v1/weather/summary
    // For now we mock it
    setData({
      temp: 32,
      condition: '☀️',
      rain: 20,
      wind: 14,
    });
  }, []);

  if (!data) return null;

  return (
    <div className="hidden lg:flex items-center space-x-3 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer" title="Weather Summary">
      <div className="flex items-center font-medium text-sm">
        <span className="mr-1 text-lg">{data.condition}</span>
        <span>{data.temp}°C</span>
      </div>
      <div className="h-4 w-px bg-gray-300 dark:bg-gray-700"></div>
      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
        <span className="flex items-center"><CloudRain className="mr-1 h-3 w-3" /> {data.rain}%</span>
        <span className="flex items-center"><Wind className="mr-1 h-3 w-3" /> {data.wind} km/h</span>
      </div>
    </div>
  );
}
