"use client";

import { useUiStore } from "@/stores/uiStore";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, X, Check, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

// Mock data
const NOTIFICATIONS = [
  { id: 1, title: "Cotton price increased by ₹350/quintal", time: "5 minutes ago", read: false, icon: "📈", action: "View Market" },
  { id: 2, title: "Order #1024 has been shipped", time: "1 hour ago", read: false, icon: "🚛", action: "Track Order" },
  { id: 3, title: "New Government Scheme available", time: "2 hours ago", read: true, icon: "🏛️", action: "View Scheme" },
];

export function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen } = useUiStore();

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationsOpen(false)}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-950 shadow-2xl z-50 border-l border-gray-200 dark:border-gray-800 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <h2 className="font-semibold text-lg">Notifications</h2>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground h-8">
                  Mark all read
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Today</h3>
              
              {NOTIFICATIONS.map(notification => (
                <div key={notification.id} className={`p-4 rounded-xl border ${notification.read ? 'border-gray-100 dark:border-gray-800 bg-transparent' : 'border-green-100 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10'}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex space-x-3">
                      <div className="text-2xl">{notification.icon}</div>
                      <div>
                        <p className={`text-sm ${notification.read ? 'text-gray-600 dark:text-gray-400' : 'text-gray-900 dark:text-gray-100 font-medium'}`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                    {!notification.read && (
                      <div className="h-2 w-2 rounded-full bg-green-500 mt-1 shrink-0" />
                    )}
                  </div>
                  <div className="mt-3 flex justify-end">
                    <Button variant="outline" size="sm" className="h-7 text-xs">
                      {notification.action}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-800">
              <Button variant="outline" className="w-full">
                Notification Settings
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
