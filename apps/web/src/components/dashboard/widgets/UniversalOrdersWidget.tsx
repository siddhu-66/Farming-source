"use client";

import { Package, MoreHorizontal, Eye, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useDashboardStore } from "@/stores/useDashboardStore";

export function UniversalOrdersWidget() {
  const { orders, isInitializing: loading } = useDashboardStore();

  const getStatusBadge = (status: string) => {
    const lower = status.toLowerCase();
    if (lower === 'completed') return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full text-xs font-medium border border-green-200 dark:border-green-900">Completed</span>;
    if (lower === 'in transit') return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2 py-1 rounded-full text-xs font-medium border border-blue-200 dark:border-blue-900">In Transit</span>;
    return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-1 rounded-full text-xs font-medium border border-amber-200 dark:border-amber-900">Pending</span>;
  };

  if (loading) {
    return <div className="h-full w-full bg-gray-100 dark:bg-gray-900 rounded-2xl animate-pulse min-h-[300px]" />;
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Package className="h-5 w-5 text-indigo-500" />
          Recent Orders
        </h3>
        <button className="text-sm text-green-600 hover:text-green-700 font-medium">View All</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-gray-50/50 dark:bg-gray-900/50 rounded-t-xl">
            <tr>
              <th className="px-4 py-3 font-medium rounded-tl-xl">Order ID</th>
              <th className="px-4 py-3 font-medium">Item / Target</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium rounded-tr-xl text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b border-gray-50 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                <td className="px-4 py-3 font-medium">{order.id}</td>
                <td className="px-4 py-3">{order.target}</td>
                <td className="px-4 py-3">{order.amount}</td>
                <td className="px-4 py-3 text-muted-foreground">{order.date}</td>
                <td className="px-4 py-3">{getStatusBadge(order.status)}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-500">
                      <CheckCircle2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500">
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No recent orders found.
          </div>
        )}
      </div>
    </div>
  );
}
