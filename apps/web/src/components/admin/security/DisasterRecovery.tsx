"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { HardDrive, CloudFog, CloudLightning, History, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import api from "@/lib/api";
import { useNotificationStore } from "@/stores/notificationStore";

export default function DisasterRecovery() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [lastBackupId, setLastBackupId] = useState<string | null>(null);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const res = await api.post("/security/backup", { type: "full" });
      setLastBackupId(res.data.backupId);
      addNotification({ title: "Backup Complete", message: "Backup completed successfully", type: "success" });
    } catch (error: any) {
      addNotification({ title: "Backup Failed", message: error.response?.data?.message || "Backup failed", type: "error" });
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    if (!lastBackupId) {
      addNotification({ title: "Warning", message: "No recent backup available to restore", type: "warning" });
      return;
    }
    
    if (!confirm("WARNING: This will overwrite current data with the selected backup. Proceed?")) return;

    setIsRestoring(true);
    try {
      await api.post("/security/restore", { backupId: lastBackupId });
      addNotification({ title: "Restore Complete", message: "System restored successfully", type: "success" });
    } catch (error: any) {
      addNotification({ title: "Restore Failed", message: error.response?.data?.message || "Restore failed", type: "error" });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <CloudFog className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Manual Backup</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create an immediate snapshot of all system data.</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg border border-gray-200 dark:border-gray-700 text-sm">
            <p className="flex justify-between mb-2">
              <span className="text-gray-500">Last Automated Backup:</span>
              <span className="font-medium text-gray-900 dark:text-white">Today, 03:00 AM</span>
            </p>
            <p className="flex justify-between">
              <span className="text-gray-500">Storage Location:</span>
              <span className="font-mono text-xs text-blue-600 dark:text-blue-400">s3://agriassist-backups/</span>
            </p>
          </div>

          <Button 
            className="w-full" 
            onClick={handleBackup} 
            disabled={isBackingUp}
          >
            {isBackingUp ? "Creating Backup..." : "Trigger Full Backup Now"}
          </Button>

          {lastBackupId && (
            <p className="text-xs text-green-600 dark:text-green-400 flex items-center justify-center gap-1 mt-2">
              <CheckCircle2 className="h-3 w-3" /> Backup created: {lastBackupId}
            </p>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl border border-red-200 dark:border-red-900/50 p-6 shadow-sm relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 dark:bg-red-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="flex items-center gap-3 mb-6 relative">
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400">
            <CloudLightning className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">Emergency Restore</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Restore the system from a previous snapshot.</p>
          </div>
        </div>

        <div className="space-y-4 relative">
          <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg border border-red-100 dark:border-red-900/30 text-sm">
            <div className="flex gap-2 items-start text-red-700 dark:text-red-400">
              <ShieldAlert className="h-5 w-5 shrink-0 mt-0.5" />
              <p>Warning: Restoring a backup will overwrite all current data. This action is irreversible and should only be performed during critical failures.</p>
            </div>
          </div>

          <Button 
            variant="danger" 
            className="w-full" 
            onClick={handleRestore}
            disabled={isRestoring || !lastBackupId}
          >
            {isRestoring ? "Restoring System..." : "Execute Emergency Restore"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
