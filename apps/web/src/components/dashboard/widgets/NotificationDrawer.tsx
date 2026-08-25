"use client";

import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, Info, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function NotificationDrawer() {
  const { notificationsOpen, setNotificationsOpen } = useUiStore();
  const { notifications } = useDashboardStore();

  const getIcon = (type?: string) => {
    switch (type) {
      case "error":
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <AnimatePresence>
      {notificationsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setNotificationsOpen(false)}
            className="fixed inset-0 z-40 bg-black/50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-80 bg-background border-l shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <h2 className="font-semibold text-lg">Notifications</h2>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setNotificationsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {(!notifications || notifications.length === 0) ? (
                <div className="text-center text-muted-foreground mt-10">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-20" />
                  <p>No new notifications</p>
                </div>
              ) : (
                notifications.map((notif: any, idx: number) => (
                  <motion.div
                    key={notif.id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-3 border rounded-lg shadow-sm flex items-start space-x-3 bg-card"
                  >
                    <div className="mt-0.5">{getIcon(notif.type)}</div>
                    <div>
                      <h4 className="font-medium text-sm">{notif.title || "Notification"}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
