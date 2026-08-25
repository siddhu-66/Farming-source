"use client";

import { Mic, Globe, Languages } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function VoiceAssistantWidget() {
  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-indigo-950/30 dark:to-blue-950/30 p-6 rounded-2xl shadow-sm border border-indigo-100 dark:border-indigo-900/50 h-full flex flex-col items-center justify-center text-center">
      <div className="relative group cursor-pointer mb-4">
        <div className="absolute -inset-4 bg-indigo-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="h-20 w-20 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center shadow-lg relative z-10 hover:scale-105 transition-transform">
          <Mic className="h-10 w-10 text-white" />
        </div>
      </div>
      
      <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-100 mb-1">Voice Assistant</h3>
      <p className="text-sm text-indigo-700/80 dark:text-indigo-300/80 mb-4">Tap to speak to AgriAssist</p>
      
      <div className="flex items-center gap-2 text-xs text-indigo-800 dark:text-indigo-200 bg-white/50 dark:bg-indigo-900/40 px-3 py-1.5 rounded-full">
        <Languages className="h-3 w-3" />
        <span>English, Telugu, Hindi</span>
      </div>
    </div>
  );
}
