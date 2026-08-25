"use client";

import { Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function GovernmentSchemeWidget() {
  const schemes = [
    { title: "PM-KISAN Samman Nidhi", status: "Active", amount: "₹6,000/year" },
    { title: "Pradhan Mantri Fasal Bima Yojana", status: "New", amount: "Crop Insurance" }
  ];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 p-6 rounded-2xl shadow-sm border border-green-100 dark:border-green-900/50 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4 text-green-800 dark:text-green-300">
        <Building2 className="h-5 w-5" />
        <h3 className="font-semibold text-lg">Govt Schemes</h3>
      </div>
      
      <div className="flex-1 space-y-3">
        {schemes.map((scheme, i) => (
          <div key={i} className="bg-white/60 dark:bg-gray-900/60 p-3 rounded-xl border border-green-200/50 dark:border-green-800/50">
            <div className="flex justify-between items-start mb-1">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">{scheme.title}</h4>
              <span className="text-[10px] bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-200 px-1.5 py-0.5 rounded font-medium ml-2 shrink-0">{scheme.status}</span>
            </div>
            <p className="text-xs text-green-700 dark:text-green-400 font-medium">{scheme.amount}</p>
          </div>
        ))}
      </div>
      
      <Button variant="outline" className="w-full mt-4 bg-white/50 dark:bg-gray-900/50 border-green-200 text-green-700 hover:bg-green-100 dark:border-green-800 dark:text-green-400 dark:hover:bg-green-900/50">
        View All Schemes <ArrowRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  );
}
