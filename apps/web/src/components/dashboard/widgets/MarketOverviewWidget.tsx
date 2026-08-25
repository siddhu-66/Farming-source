"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { TrendingUp, TrendingDown, Minus, Store } from "lucide-react";

export function MarketOverviewWidget() {
  const { externalData } = useDashboardStore();
  const market = externalData?.market;

  if (!market || !Array.isArray(market)) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg flex items-center">
          <Store className="w-5 h-5 mr-2 text-indigo-600" />
          Market Overview
        </CardTitle>
        <CardDescription>Live prices from nearby mandis</CardDescription>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="divide-y divide-gray-100 dark:divide-gray-800">
          {market.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${
                  item.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  item.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400'
                }`}>
                  {item.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                  {item.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                  {item.trend === 'stable' && <Minus className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{item.crop}</h4>
                  <p className="text-xs text-muted-foreground">Kurnool Mandi</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900 dark:text-gray-100">₹{item.price}</p>
                <p className="text-xs text-muted-foreground">/ quintal</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 text-center">
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
            View All Markets →
          </button>
        </div>
      </CardContent>
    </Card>
  );
}
