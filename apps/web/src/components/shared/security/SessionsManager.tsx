"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Smartphone, Monitor, Globe, LogOut, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import api from "@/lib/api";
import { useNotificationStore } from "@/stores/notificationStore";

interface Session {
  id: string;
  device: string;
  browser: string;
  ip_address: string;
  location: string;
  last_activity: string;
  is_active: boolean;
}

export default function SessionsManager() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const addNotification = useNotificationStore((state) => state.addNotification);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await api.get("/security/sessions");
      setSessions(res.data.data);
    } catch (error) {
      console.error("Failed to fetch sessions", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutDevice = async (sessionId: string) => {
    // In a real implementation, this would call an API endpoint to revoke that specific token.
    // We simulate it here for the UI.
    setSessions(sessions.filter(s => s.id !== sessionId));
    addNotification({ title: "Success", message: "Device logged out successfully", type: "success" });
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading sessions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-gray-200 dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Sessions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage devices where your account is currently logged in.
          </p>
        </div>
        <Button variant="danger" className="hidden sm:flex">
          Log Out All Other Devices
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <div 
            key={session.id} 
            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          >
            <div className="flex items-start gap-4 mb-4 sm:mb-0">
              <div className={`p-3 rounded-full ${session.is_active ? 'bg-green-100 dark:bg-green-900/30 text-green-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {session.device.toLowerCase().includes('phone') ? (
                  <Smartphone className="h-6 w-6" />
                ) : (
                  <Monitor className="h-6 w-6" />
                )}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {session.device} - {session.browser}
                  {session.is_active && (
                    <Badge variant="success" className="text-xs py-0 h-5">Current Device</Badge>
                  )}
                </h4>
                <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 mt-1">
                  <span className="flex items-center gap-1">
                    <Globe className="h-3 w-3" /> {session.location} ({session.ip_address})
                  </span>
                  <span className="hidden sm:inline text-gray-300 dark:text-gray-600">•</span>
                  <span>
                    Last active: {format(new Date(session.last_activity), "PPp")}
                  </span>
                </div>
              </div>
            </div>

            {!session.is_active && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleLogoutDevice(session.id)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 border-red-200 dark:border-red-900/50 self-start sm:self-auto"
              >
                <LogOut className="h-4 w-4 mr-2" /> Log Out
              </Button>
            )}
            {session.is_active && (
              <div className="text-green-600 dark:text-green-500 flex items-center gap-2 text-sm font-medium self-start sm:self-auto px-3">
                <CheckCircle2 className="h-5 w-5" /> Active Now
              </div>
            )}
          </div>
        ))}
      </div>
      
      <Button variant="danger" className="w-full sm:hidden">
        Log Out All Other Devices
      </Button>
    </div>
  );
}
