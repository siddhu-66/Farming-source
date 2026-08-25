"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { motion } from "framer-motion";
import { Plus, Search, Navigation, Truck, Factory, ShieldCheck, Zap, Droplets, Wallet, Landmark, Mic, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useUiStore } from "@/stores/uiStore";

export function QuickActionPanel() {
  const { profile } = useDashboardStore();
  const { setAiAssistantOpen } = useUiStore();
  const router = useRouter();
  
  const role = profile?.role?.toLowerCase() || 'farmer';

  let actions: { label: string; icon: any; route?: string; action?: () => void; color: string }[] = [];

  switch (role) {
    case 'farmer':
      actions = [
        { label: 'Add Crop', icon: Plus, route: '/farmer/crops/new', color: 'bg-green-100 text-green-700' },
        { label: 'Sell Crop', icon: Search, route: '/farmer/marketplace/sell', color: 'bg-blue-100 text-blue-700' },
        { label: 'Find Buyer', icon: Search, route: '/farmer/buyers', color: 'bg-indigo-100 text-indigo-700' },
        { label: 'Book Transport', icon: Truck, route: '/farmer/transport/new', color: 'bg-amber-100 text-amber-700' },
        { label: 'Scan Disease', icon: Zap, action: () => setAiAssistantOpen(true), color: 'bg-purple-100 text-purple-700' },
        { label: 'Soil Analysis', icon: Droplets, route: '/farmer/reports/soil', color: 'bg-cyan-100 text-cyan-700' },
        { label: 'Wallet', icon: Wallet, route: '/farmer/wallet', color: 'bg-emerald-100 text-emerald-700' },
        { label: 'Govt Schemes', icon: Landmark, route: '/farmer/schemes', color: 'bg-rose-100 text-rose-700' },
        { label: 'Voice Assist', icon: Mic, action: () => setAiAssistantOpen(true), color: 'bg-pink-100 text-pink-700' },
        { label: 'Reports', icon: BarChart, route: '/farmer/reports', color: 'bg-orange-100 text-orange-700' },
      ];
      break;
    case 'buyer':
      actions = [
        { label: 'Create Request', icon: Plus, route: '/buyer/procurement/new', color: 'bg-green-100 text-green-700' },
        { label: 'Find Farmers', icon: Search, route: '/buyer/marketplace', color: 'bg-blue-100 text-blue-700' },
        { label: 'Compare Prices', icon: Navigation, route: '/buyer/analytics', color: 'bg-amber-100 text-amber-700' },
      ];
      break;
    case 'transport':
      actions = [
        { label: 'Accept Delivery', icon: ShieldCheck, route: '/transport/deliveries', color: 'bg-green-100 text-green-700' },
        { label: 'Add Vehicle', icon: Plus, route: '/transport/vehicles/new', color: 'bg-blue-100 text-blue-700' },
        { label: 'Optimize Route', icon: Navigation, action: () => setAiAssistantOpen(true), color: 'bg-amber-100 text-amber-700' },
      ];
      break;
    case 'industry':
      actions = [
        { label: 'Procurement', icon: Factory, route: '/industry/procurement', color: 'bg-green-100 text-green-700' },
        { label: 'Inventory', icon: Search, route: '/industry/inventory', color: 'bg-blue-100 text-blue-700' },
        { label: 'Create Contract', icon: Plus, route: '/industry/contracts/new', color: 'bg-amber-100 text-amber-700' },
      ];
      break;
    case 'admin':
      actions = [
        { label: 'Create User', icon: Plus, route: '/admin/users/new', color: 'bg-green-100 text-green-700' },
        { label: 'Verify Docs', icon: ShieldCheck, route: '/admin/verification', color: 'bg-blue-100 text-blue-700' },
        { label: 'Broadcast', icon: Navigation, route: '/admin/notifications/new', color: 'bg-amber-100 text-amber-700' },
      ];
      break;
  }

  return (
    <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 h-full flex flex-col">
      <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-3 flex-1 overflow-y-auto pr-1 custom-scrollbar">
        {actions.map((action, index) => {
          const Icon = action.icon;
          return (
            <motion.button
              key={index}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => action.action ? action.action() : router.push(action.route!)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group bg-gray-50/50 dark:bg-gray-900/50"
            >
              <div className={`p-2.5 rounded-full mb-2 ${action.color} dark:bg-opacity-20`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-medium text-center text-gray-700 dark:text-gray-300 group-hover:text-green-600 dark:group-hover:text-green-400">
                {action.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
