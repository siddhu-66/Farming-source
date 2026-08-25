"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Map, Droplets, Sun, Layers } from "lucide-react";

export function LandSummaryWidget() {
  const { landSummary } = useDashboardStore();

  if (!landSummary) return null;

  const data = [
    { name: "Irrigated", value: landSummary.irrigatedAcres, color: "#3b82f6" },
    { name: "Rain-fed", value: landSummary.rainFedAcres, color: "#eab308" },
    { name: "Available", value: landSummary.availableLand, color: "#22c55e" },
  ];

  return (
    <Card className="h-full">
      <CardHeader className="pb-2 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg flex items-center">
          <Map className="w-5 h-5 mr-2 text-green-600" />
          Land Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Chart Side */}
        <div className="w-full md:w-1/2 h-[150px] relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                formatter={(value: number) => [`${value} Acres`, '']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{landSummary.totalAcres}</span>
            <span className="text-xs text-muted-foreground">Acres</span>
          </div>
        </div>

        {/* Legend / Details Side */}
        <div className="w-full md:w-1/2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
              <span className="text-muted-foreground flex items-center gap-1"><Droplets className="w-3 h-3"/> Irrigated</span>
            </div>
            <span className="font-semibold">{landSummary.irrigatedAcres} Ac</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
              <span className="text-muted-foreground flex items-center gap-1"><Sun className="w-3 h-3"/> Rain-fed</span>
            </div>
            <span className="font-semibold">{landSummary.rainFedAcres} Ac</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <span className="text-muted-foreground flex items-center gap-1"><Layers className="w-3 h-3"/> Available</span>
            </div>
            <span className="font-semibold">{landSummary.availableLand} Ac</span>
          </div>
          <div className="pt-2 mt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between items-center">
            <span className="text-sm font-medium">Active Fields</span>
            <span className="text-sm font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-md">
              {landSummary.activeFields}
            </span>
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
