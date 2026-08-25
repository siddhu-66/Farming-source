"use client";

import { useState } from "react";
import { Shield, Download, Trash2, Eye, Bell, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import SessionsManager from "@/components/shared/security/SessionsManager";
import { useNotificationStore } from "@/stores/notificationStore";

export default function PrivacyPage() {
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [marketingConsent, setMarketingConsent] = useState(true);
  const [dataSharingConsent, setDataSharingConsent] = useState(false);

  const handleDataDownload = () => {
    addNotification({ title: "Export Started", message: "Data export started. We will email you when it's ready.", type: "success" });
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you absolutely sure you want to delete your account? This action cannot be undone.")) {
      addNotification({ title: "Account Deletion", message: "Account deletion request submitted.", type: "warning" });
    }
  };

  return (
    <div className="p-4 sm:p-8 w-full max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <Shield className="h-8 w-8 text-green-600 dark:text-green-500" />
          Privacy & Security
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage your account security, connected devices, and data privacy settings.
        </p>
      </div>

      <Tabs defaultValue="sessions" className="w-full">
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg flex flex-wrap">
          <TabsTrigger value="sessions" className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Active Sessions
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Eye className="h-4 w-4" /> Privacy Controls
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Download className="h-4 w-4" /> Your Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sessions">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <SessionsManager />
          </div>
        </TabsContent>

        <TabsContent value="privacy">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
            
            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="h-5 w-5 text-gray-400" /> Marketing Communications
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Receive emails and SMS about new schemes, market trends, and platform updates.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={marketingConsent}
                  onChange={() => setMarketingConsent(!marketingConsent)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

            <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Eye className="h-5 w-5 text-gray-400" /> Third-Party Data Sharing
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Allow anonymized data sharing with research institutions to improve agricultural AI models.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={dataSharingConsent}
                  onChange={() => setDataSharingConsent(!dataSharingConsent)}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600"></div>
              </label>
            </div>

          </div>
        </TabsContent>

        <TabsContent value="data">
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600">
                  <Download className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Download Your Data</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                    Get a copy of your AgriAssist data including your profile, listings, orders, and AI reports. The export may take a few minutes to generate.
                  </p>
                  <Button onClick={handleDataDownload} variant="outline">
                    Request Data Export
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-red-200 dark:border-red-900/50">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600">
                  <Trash2 className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">Delete Account</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone. Active contracts or orders must be completed first.
                  </p>
                  <Button onClick={handleDeleteAccount} variant="danger">
                    Delete Account
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
