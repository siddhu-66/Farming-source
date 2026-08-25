"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, MonitorSmartphone, Smartphone, Monitor, KeyRound, SmartphoneNfc, LogOut, Loader2, AlertTriangle, Fingerprint } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function SecuritySettings() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [sessionsRes, devicesRes] = await Promise.all([
        api.get('/api/v1/auth/sessions'),
        api.get('/api/v1/auth/devices')
      ]);
      if (sessionsRes.data?.success) setSessions(sessionsRes.data.data.sessions);
      if (devicesRes.data?.success) setDevices(devicesRes.data.data.devices);
    } catch (error) {
      toast.error("Failed to load security settings");
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (id: string) => {
    try {
      await api.delete(`/api/v1/auth/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      toast.success("Session revoked successfully");
    } catch (error) {
      toast.error("Failed to revoke session");
    }
  };

  const logoutAll = async () => {
    try {
      await api.delete('/api/v1/auth/sessions');
      setSessions([]);
      toast.success("Logged out of all other sessions");
    } catch (error) {
      toast.error("Failed to log out of all sessions");
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-[50vh]"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Security & Devices</h1>
          <p className="text-muted-foreground">Manage your active sessions, trusted devices, and multi-factor authentication.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Sessions and Devices */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Sessions */}
          <Card className="border-t-4 border-t-emerald-500 shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <MonitorSmartphone className="w-5 h-5 text-emerald-500" /> Active Sessions
                </CardTitle>
                <CardDescription>You're currently logged in on these devices.</CardDescription>
              </div>
              <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50" onClick={logoutAll}>
                <LogOut className="w-4 h-4 mr-2" /> Logout All
              </Button>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {sessions.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No active sessions found.</p>
              ) : (
                sessions.map((session, idx) => (
                  <motion.div key={session.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="flex justify-between items-center p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-slate-100 rounded-full text-slate-500">
                        {session.browser?.toLowerCase().includes('mobile') || session.device_info?.toLowerCase().includes('mobile') ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {session.device_info || session.browser || 'Unknown Device'}
                        </p>
                        <div className="text-xs text-slate-500 flex gap-2 items-center">
                          <span>{session.ip_address || 'Unknown IP'}</span>
                          <span>•</span>
                          <span>{session.location || 'Unknown Location'}</span>
                          <span>•</span>
                          <span className="text-emerald-600 font-medium">Last active: {new Date(session.last_activity).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-red-500 hover:bg-red-50" size="sm" onClick={() => revokeSession(session.id)}>
                      Revoke
                    </Button>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Trusted Devices */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Fingerprint className="w-5 h-5 text-blue-500" /> Trusted Devices
              </CardTitle>
              <CardDescription>Devices that don't require Two-Factor Authentication.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {devices.length === 0 ? (
                <p className="text-sm text-slate-500 text-center py-4">No trusted devices found.</p>
              ) : (
                devices.map((device, idx) => (
                  <motion.div key={device.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }} className="flex justify-between items-center p-4 border rounded-xl bg-slate-50/50">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                        {device.os?.toLowerCase().includes('ios') || device.os?.toLowerCase().includes('android') ? <Smartphone className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 flex items-center gap-2">
                          {device.device_name} 
                          {device.security_score >= 90 && <span className="text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold">High Security</span>}
                        </p>
                        <p className="text-xs text-slate-500">
                          {device.browser} on {device.os} • Trusted since {new Date(device.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Settings & Passwords */}
        <div className="lg:col-span-1 space-y-8">
          
          <Card className="shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white border-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <SmartphoneNfc className="w-5 h-5 text-emerald-400" /> Multi-Factor Auth
              </CardTitle>
              <CardDescription className="text-slate-300">Add an extra layer of security to your account.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">SMS Verification</p>
                  <p className="text-xs text-slate-400">Receive OTP on login</p>
                </div>
                <Switch checked={true} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold">Authenticator App</p>
                  <p className="text-xs text-slate-400">Coming soon</p>
                </div>
                <Switch checked={false} disabled />
              </div>
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white border-0">Update Phone Number</Button>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-slate-700" /> Password Policy
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                <div className="flex items-start gap-3 text-amber-800">
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-sm">Update Recommended</p>
                    <p className="text-xs mt-1 text-amber-700">Your password is 82 days old. We recommend rotating passwords every 90 days.</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="w-full">Change Password</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
