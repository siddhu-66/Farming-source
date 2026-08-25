"use client";

import { useState } from "react";
import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tractor, LogOut, ChevronDown, ChevronRight, Plus } from "lucide-react";
import { NAVIGATION_MATRIX, MenuItem } from "@/config/navigation";

export function GlobalSidebar() {
  const { sidebarExpanded } = useUiStore();
  const { profile } = useDashboardStore();
  const pathname = usePathname();
  const router = useRouter();

  // Expanded groups tracking
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const role = profile?.role?.toUpperCase() || 'FARMER';
  const navConfig = NAVIGATION_MATRIX[role] || NAVIGATION_MATRIX['FARMER'];

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.title];
    const isActive = item.route ? pathname.startsWith(item.route) : false;

    // We don't hide items based on permission locally yet (we mock the UI).
    // The backend API will eventually filter out items without permission.

    return (
      <li key={item.title} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleSubmenu(item.title)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isChild ? "pl-9" : "",
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
            title={!sidebarExpanded ? item.title : undefined}
          >
            <div className="flex items-center">
              {Icon && <Icon className={cn("h-5 w-5", sidebarExpanded && "mr-3", isChild && "h-4 w-4 mr-2")} />}
              {sidebarExpanded && <span>{item.title}</span>}
            </div>
            {sidebarExpanded && (
              isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <Link
            href={item.route || "#"}
            className={cn(
              "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isChild ? "pl-11 py-1.5 text-xs" : "",
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
            title={!sidebarExpanded ? item.title : undefined}
          >
            <div className="flex items-center">
              {Icon && <Icon className={cn("h-5 w-5", sidebarExpanded && "mr-3", isChild && "h-4 w-4 mr-2")} />}
              {sidebarExpanded && <span>{item.title}</span>}
            </div>
            {item.badge && sidebarExpanded && (
              <span className="flex h-5 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                {item.badge}
              </span>
            )}
            {item.badge && !sidebarExpanded && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500"></span>
            )}
          </Link>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && sidebarExpanded && (
            <motion.ul
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-1 overflow-hidden"
            >
              {item.children!.map((child) => renderMenuItem(child, true))}
            </motion.ul>
          )}
        </AnimatePresence>
      </li>
    );
  };

  return (
    <motion.div
      initial={false}
      animate={{ width: sidebarExpanded ? 280 : 80 }}
      className="hidden md:flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 z-30 h-full"
    >
      <div className="flex h-18 shrink-0 items-center justify-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center space-x-2 px-4">
          <Tractor className="h-8 w-8 text-green-600 shrink-0" />
          {sidebarExpanded && (
            <span className="text-xl font-bold text-gray-900 dark:text-white truncate">
              AgriAssist
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4">
        {navConfig.groups.map((group, idx) => (
          <div key={group.title} className="mb-6 px-3">
            {sidebarExpanded && (
              <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                {group.title}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => renderMenuItem(item))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 p-4 shrink-0">
        {/* Quick Actions */}
        {sidebarExpanded && navConfig.quickActions.length > 0 && (
          <div className="mb-4 grid grid-cols-1 gap-2">
            {navConfig.quickActions.map(action => (
              <button
                key={action.title}
                onClick={() => action.onClickRoute && router.push(action.onClickRoute)}
                className="flex items-center justify-center space-x-2 rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
              >
                <action.icon className="h-4 w-4" />
                <span>{action.title}</span>
              </button>
            ))}
          </div>
        )}
        {!sidebarExpanded && navConfig.quickActions.length > 0 && (
          <div className="mb-4 flex flex-col items-center gap-2">
            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-green-600 text-white hover:bg-green-700">
              <Plus className="h-5 w-5" />
            </button>
          </div>
        )}

        <button
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
          onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/login';
          }}
          title={!sidebarExpanded ? "Logout" : undefined}
        >
          <LogOut className={cn("h-5 w-5 shrink-0", sidebarExpanded && "mr-3")} />
          {sidebarExpanded && <span>Logout</span>}
        </button>
      </div>
    </motion.div>
  );
}
