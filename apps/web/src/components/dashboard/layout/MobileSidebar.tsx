"use client";

import { useState } from "react";
import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Tractor, LogOut, ChevronDown, ChevronRight, X, Plus } from "lucide-react";
import { NAVIGATION_MATRIX, MenuItem } from "@/config/navigation";

export function MobileSidebar() {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useUiStore();
  const { profile } = useDashboardStore();
  const pathname = usePathname();
  const router = useRouter();

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});

  const role = profile?.role?.toUpperCase() || 'FARMER';
  const navConfig = NAVIGATION_MATRIX[role] || NAVIGATION_MATRIX['FARMER'];

  const toggleSubmenu = (title: string) => {
    setExpandedMenus(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const handleNavigate = (route: string) => {
    setMobileSidebarOpen(false);
    router.push(route);
  };

  const renderMenuItem = (item: MenuItem, isChild = false) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus[item.title];
    const isActive = item.route ? pathname.startsWith(item.route) : false;

    return (
      <li key={item.title} className="mb-1">
        {hasChildren ? (
          <button
            onClick={() => toggleSubmenu(item.title)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors",
              isChild ? "pl-9" : "",
              "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <div className="flex items-center">
              {Icon && <Icon className={cn("h-6 w-6 mr-3", isChild && "h-5 w-5 mr-2")} />}
              <span>{item.title}</span>
            </div>
            {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        ) : (
          <button
            onClick={() => item.route && handleNavigate(item.route)}
            className={cn(
              "flex w-full items-center justify-between rounded-lg px-3 py-3 text-base font-medium transition-colors",
              isChild ? "pl-11 py-2 text-sm" : "",
              isActive
                ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
            )}
          >
            <div className="flex items-center">
              {Icon && <Icon className={cn("h-6 w-6 mr-3", isChild && "h-5 w-5 mr-2")} />}
              <span>{item.title}</span>
            </div>
            {item.badge && (
              <span className="flex h-6 items-center justify-center rounded-full bg-red-100 px-2 text-xs font-bold text-red-600 dark:bg-red-900/40 dark:text-red-400">
                {item.badge}
              </span>
            )}
          </button>
        )}

        <AnimatePresence>
          {hasChildren && isExpanded && (
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
    <AnimatePresence>
      {mobileSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[80%] max-w-sm flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 md:hidden"
          >
            <div className="flex h-18 shrink-0 items-center justify-between border-b border-gray-200 px-4 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <Tractor className="h-8 w-8 text-green-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  AgriAssist
                </span>
              </div>
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4">
              {navConfig.groups.map((group) => (
                <div key={group.title} className="mb-6 px-3">
                  <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {group.title}
                  </h3>
                  <ul className="space-y-1">
                    {group.items.map((item) => renderMenuItem(item))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 p-4 dark:border-gray-800 shrink-0">
              {navConfig.quickActions.length > 0 && (
                <div className="mb-4 grid grid-cols-1 gap-2">
                  {navConfig.quickActions.map(action => (
                    <button
                      key={action.title}
                      onClick={() => action.onClickRoute && handleNavigate(action.onClickRoute)}
                      className="flex items-center justify-center space-x-2 rounded-md bg-green-600 px-3 py-3 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                    >
                      <action.icon className="h-5 w-5" />
                      <span>{action.title}</span>
                    </button>
                  ))}
                </div>
              )}

              <button
                className="flex w-full items-center justify-center rounded-lg px-3 py-3 text-base font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                onClick={() => {
                  localStorage.removeItem('token');
                  window.location.href = '/login';
                }}
              >
                <LogOut className="h-5 w-5 mr-3 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
