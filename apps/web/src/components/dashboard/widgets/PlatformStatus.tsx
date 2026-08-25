"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export function PlatformStatus() {
  const [status, setStatus] = useState<'online' | 'maintenance' | 'disruption'>('online');

  useEffect(() => {
    // In the future this will fetch from /health or socket connection status
    // For now we mock it as online
    setStatus('online');
  }, []);

  const getStatusColor = () => {
    switch (status) {
      case 'online': return "bg-green-500";
      case 'maintenance': return "bg-yellow-500";
      case 'disruption': return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online': return "Online";
      case 'maintenance': return "Maintenance";
      case 'disruption': return "Disrupted";
      default: return "Unknown";
    }
  };

  return (
    <div 
      className="flex items-center space-x-1.5 px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-800 cursor-help"
      title={`API: Healthy\nSocket: Connected\nDatabase: Online\nAI: Online`}
    >
      <span className="relative flex h-2 w-2">
        {status === 'online' && (
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        )}
        <span className={cn("relative inline-flex rounded-full h-2 w-2", getStatusColor())}></span>
      </span>
      <span className="text-[10px] uppercase font-bold text-gray-500 dark:text-gray-400 tracking-wider hidden md:inline-block">
        {getStatusText()}
      </span>
    </div>
  );
}
