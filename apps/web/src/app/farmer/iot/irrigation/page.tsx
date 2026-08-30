"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Droplets, Power, Play, Square, Loader2, ArrowLeft, Waves, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function SmartIrrigation() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isIrrigating, setIsIrrigating] = useState(false);
  const [logId, setLogId] = useState<string | null>(null);
  const [telemetry, setTelemetry] = useState<any>(null);
  const [fetchingSensors, setFetchingSensors] = useState(true);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      const res = await api.get('/api/v1/iot/sensors');
      if (res.data?.success) {
        setTelemetry(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch sensors", err);
    } finally {
      setFetchingSensors(false);
    }
  };

  const toggleIrrigation = async () => {
    setLoading(true);
    try {
      if (isIrrigating) {
        const res = await api.post('/api/v1/iot/irrigation/stop', { logId });
        if (res.data?.success) {
          setIsIrrigating(false);
          setLogId(null);
          toast.success("Irrigation stopped");
        }
      } else {
        const res = await api.post('/api/v1/iot/irrigation/start', { zoneId: null, durationMinutes: 30 });
        if (res.data?.success) {
          setIsIrrigating(true);
          setLogId(res.data.data.log.id);
          toast.success("Irrigation started");
        }
      }
    } catch (err) {
      toast.error("Command failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Smart Irrigation Control</h1>
          <p className="text-muted-foreground">Manage your water pumps and automate irrigation schedules.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Main Controller */}
        <Card className="overflow-hidden border-2 border-slate-100 shadow-xl relative group">
          <div className={`absolute inset-0 bg-blue-500/5 transition-opacity ${isIrrigating ? 'opacity-100' : 'opacity-0'}`} />
          <CardContent className="p-8 flex flex-col items-center justify-center text-center h-full relative z-10 space-y-8">
            
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-slate-800">Main Water Pump</h2>
              <div className="flex items-center justify-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isIrrigating ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                <p className="font-bold text-sm text-slate-500 uppercase tracking-widest">{isIrrigating ? 'Running' : 'Standby'}</p>
              </div>
            </div>

            <div className="relative">
              <AnimatePresence>
                {isIrrigating && (
                  <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.8, opacity: 0 }}
                    className="absolute inset-0 rounded-full bg-blue-100 animate-ping"
                  />
                )}
              </AnimatePresence>
              <Button 
                onClick={toggleIrrigation}
                disabled={loading}
                className={`relative w-40 h-40 rounded-full shadow-2xl transition-all flex flex-col items-center justify-center gap-2 ${
                  isIrrigating 
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-500/30 hover:scale-95' 
                    : 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-500/30 hover:scale-105'
                }`}
              >
                {loading ? <Loader2 className="w-10 h-10 animate-spin" /> : isIrrigating ? <Square className="w-10 h-10 fill-current" /> : <Power className="w-12 h-12" />}
                <span className="font-bold text-lg">{isIrrigating ? 'STOP PUMP' : 'START PUMP'}</span>
              </Button>
            </div>

            {isIrrigating && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-blue-600 font-bold bg-blue-50 px-4 py-2 rounded-full border border-blue-100">
                <Waves className="w-5 h-5 animate-pulse" /> Actively watering North Field
              </motion.div>
            )}

          </CardContent>
        </Card>

        {/* Schedules & Status */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-600" /> Upcoming Schedules
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-slate-800">Evening Watering</h4>
                    <p className="text-sm text-slate-500">North Field • 45 mins</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">Today</p>
                    <p className="text-sm font-bold text-slate-800">06:00 PM</p>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border flex justify-between items-center opacity-70">
                  <div>
                    <h4 className="font-bold text-slate-800">Morning Drip</h4>
                    <p className="text-sm text-slate-500">South Field • 30 mins</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-blue-600">Tomorrow</p>
                    <p className="text-sm font-bold text-slate-800">06:00 AM</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full font-bold">Add New Schedule</Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
            <CardContent className="p-6">
              <h3 className="font-bold text-blue-900 flex items-center gap-2 mb-2">
                <Droplets className="w-5 h-5 text-blue-600" /> Soil Moisture Status
              </h3>
              {fetchingSensors ? (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Loading sensor data...</span>
                </div>
              ) : !telemetry ? (
                <p className="text-blue-800 text-sm">
                  No soil moisture telemetry available. Connect sensors to monitor soil conditions.
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Current Soil Moisture</span>
                    <span className="text-sm font-bold text-blue-700">{typeof telemetry.soilMoisture === 'number' ? `${telemetry.soilMoisture.toFixed(1)}%` : '--'}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-white/60 rounded-lg">
                    <span className="text-sm font-medium text-blue-900">Water Tank Level</span>
                    <span className="text-sm font-bold text-blue-700">{typeof telemetry.waterTankLevel === 'number' ? `${telemetry.waterTankLevel}%` : '--'}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
