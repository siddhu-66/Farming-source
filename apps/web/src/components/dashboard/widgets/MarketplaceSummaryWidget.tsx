"use client";

import { ShoppingCart, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDashboardStore } from "@/stores/useDashboardStore";

export function MarketplaceSummaryWidget() {
  const { profile } = useDashboardStore();
  const role = profile?.role?.toLowerCase() || 'farmer';

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <ShoppingCart className="h-5 w-5 text-blue-500" />
          {role === 'buyer' ? 'New Listings' : 'Trending Crops'}
        </h3>
        <TrendingUp className="h-4 w-4 text-gray-400" />
      </div>

      <div className="flex-1 space-y-4">
        {[1, 2, 3].map((item) => (
          <div key={item} className="flex justify-between items-center border-b border-gray-50 dark:border-gray-900 pb-3 last:border-0 last:pb-0">
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{role === 'buyer' ? 'Premium Organic Wheat' : 'Cotton - High Demand'}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{role === 'buyer' ? '2.5 Tons • 5km away' : 'Price up 5% today'}</p>
            </div>
            <p className="text-sm font-bold text-green-600 dark:text-green-400">
              {role === 'buyer' ? '₹2,400/q' : '₹6,500/q'}
            </p>
          </div>
        ))}
      </div>

      <Button variant="outline" className="w-full mt-4">
        View Marketplace
      </Button>
    </div>
  );
}
