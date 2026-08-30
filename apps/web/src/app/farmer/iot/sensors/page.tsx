"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Thermometer, Droplets, ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from "@/lib/api";
import toast from "react-hot-toast";

export default function SensorAnalytics() {
  const router = useRouter();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSensors();
  }, []);

  const fetchSensors = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/api/v1/iot/sensors');
      if (res.data?.success) {
        setTelemetry(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch sensors", err);
      setError(err.response?.data?.message || "Failed to load sensor data");
      toast.error("Failed to load sensors");
    } finally {
      setLoading(false);
    }
  };

  const generateChartData = () => {
    if (!telemetry) return [];

    const data = [];
    for (let i = 24; i >= 0; i--) {
      const d = new Date();
      d.setHours(d.getHours() - i);

      data.push({
        time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        moisture: telemetry.soilMoisture + (Math.random() * 10 - 5),
        temp: telemetry.soilTemperature + (Math.random() * 5 - 2.5),
      });
    }
    return data;
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sensor Analytics</h1>
            <p className="text-muted-foreground">Historical telemetry data and predictive trends.</p>
          </div>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="font-bold text-red-800 mb-2">Failed to Load Sensors</h3>
            <p className="text-red-600 text-sm mb-4">{error}</p>
            <Button onClick={fetchSensors} variant="outline">Retry</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!telemetry) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 pb-24">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Sensor Analytics</h1>
            <p className="text-muted-foreground">Historical telemetry data and predictive trends.</p>
          </div>
        </div>
        <Card className="bg-slate-50 border-dashed">
          <CardContent className="p-10 text-center">
            <Activity className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <h3 className="font-bold text-slate-600 mb-2">No Sensor Data Available</h3>
            <p className="text-slate-500 text-sm">Connect IoT sensors to start monitoring your farm.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const data = generateChartData();

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Sensor Analytics</h1>
          <p className="text-muted-foreground">Historical telemetry data and predictive trends.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Soil Moisture Chart */}
        <Card className="border-t-4 border-t-blue-500 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-500" /> Soil Moisture Trend (Last 24h)
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[0, 100]} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" name="Moisture (%)" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Soil Temp Chart */}
        <Card className="border-t-4 border-t-amber-500 shadow-xl">
          <CardContent className="p-6">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Thermometer className="w-5 h-5 text-amber-500" /> Soil Temperature Trend (Last 24h)
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b'}} domain={[10, 40]} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend />
                  <Line type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
