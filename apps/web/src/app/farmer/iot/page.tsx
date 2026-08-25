"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Wifi, Map, Droplets, Thermometer, Wind, CloudRain, Cpu, AlertTriangle, ArrowRight, Plane } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

const QUICK_ACTIONS = [
  { title: "Smart Irrigation", icon: Droplets, route: "/farmer/iot/irrigation", color: "text-blue-600", bg: "bg-blue-100" },
  { title: "Sensor Analytics", icon: Activity, route: "/farmer/iot/sensors", color: "text-emerald-600", bg: "bg-emerald-100" },
  { title: "Farm Map", icon: Map, route: "/farmer/iot/maps", color: "text-amber-600", bg: "bg-amber-100" },
  { title: "Drone Management", icon: Plane, route: "/farmer/iot/drones", color: "text-purple-600", bg: "bg-purple-100" },
  { title: "Satellite Data", icon: CloudRain, route: "/farmer/iot/satellite", color: "text-indigo-600", bg: "bg-indigo-100" },
  { title: "Precision Analytics", icon: Cpu, route: "/farmer/iot/analytics", color: "text-pink-600", bg: "bg-pink-100" },
];

export default function IotDashboard() {
  const router = useRouter();
  const [telemetry, setTelemetry] = useState<any>(null);
  const [weather, setWeather] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s for simulation
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sensorsRes, weatherRes, alertsRes] = await Promise.all([
        api.get('/api/v1/iot/sensors'),
        api.get('/api/v1/iot/weather'),
        api.get('/api/v1/iot/alerts')
      ]);
      if (sensorsRes.data?.success) setTelemetry(sensorsRes.data.data);
      if (weatherRes.data?.success) setWeather(weatherRes.data.data);
      if (alertsRes.data?.success) setAlerts(alertsRes.data.data.alerts);
    } catch (err) {
      console.error("Failed to fetch IoT data", err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      {/* Header Banner */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden"
      >
        <div className="relative z-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">Smart Farm Dashboard</h1>
            <p className="text-slate-300 max-w-lg text-lg">Real-time monitoring and precision agriculture controls.</p>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-emerald-500/20 px-4 py-2 rounded-full border border-emerald-500/30">
            <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
            <span className="font-bold text-emerald-300">Live Connection Active</span>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
          <Cpu className="w-64 h-64 -mb-16 -mr-16 text-white" />
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {QUICK_ACTIONS.map((action, idx) => (
          <motion.div 
            key={idx} 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: idx * 0.1 }}
            onClick={() => router.push(action.route)}
          >
            <Card className="hover:shadow-lg transition-all cursor-pointer border-transparent hover:border-slate-300 group h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-xl ${action.bg} group-hover:scale-110 transition-transform`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <h3 className="font-bold text-slate-800 text-lg">{action.title}</h3>
                </div>
                <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-800 transition-colors" />
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Telemetry Grid */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-600" /> Live Sensor Data
          </h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            
            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-500">Soil Moisture</p>
                  <Droplets className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{telemetry ? telemetry.soilMoisture.toFixed(1) : '--'}%</h3>
                <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${telemetry?.soilMoisture || 0}%` }} 
                    className="h-full bg-blue-500" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-500">Soil Temp</p>
                  <Thermometer className="w-4 h-4 text-amber-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{telemetry ? telemetry.soilTemperature.toFixed(1) : '--'}°C</h3>
                <p className="text-xs text-amber-600 font-medium mt-2">Optimal</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-slate-500">pH Level</p>
                  <Activity className="w-4 h-4 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800">{telemetry ? telemetry.phLevel.toFixed(1) : '--'}</h3>
                <p className="text-xs text-purple-600 font-medium mt-2">Slightly Acidic</p>
              </CardContent>
            </Card>

            <Card className="col-span-2 sm:col-span-3 bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-100">
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-bold text-emerald-800">NPK Levels (mg/kg)</p>
                  <Activity className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center divide-x divide-emerald-200">
                  <div>
                    <p className="text-xs font-bold text-emerald-600 mb-1">Nitrogen (N)</p>
                    <h4 className="text-xl font-bold text-emerald-900">{telemetry ? telemetry.nitrogen : '--'}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 mb-1">Phosphorus (P)</p>
                    <h4 className="text-xl font-bold text-emerald-900">{telemetry ? telemetry.phosphorus : '--'}</h4>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-600 mb-1">Potassium (K)</p>
                    <h4 className="text-xl font-bold text-emerald-900">{telemetry ? telemetry.potassium : '--'}</h4>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar: Weather & Alerts */}
        <div className="space-y-6">
          
          {/* Micro Climate */}
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
              <CloudRain className="w-5 h-5 text-blue-600" /> Farm Weather
            </h2>
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-4xl font-bold text-slate-800">{weather ? weather.temperature : '--'}°C</h3>
                    <p className="font-medium text-blue-600">{weather ? weather.condition : 'Loading...'}</p>
                  </div>
                  <CloudRain className="w-12 h-12 text-blue-400" />
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Wind</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1"><Wind className="w-3 h-3 text-slate-400"/> {weather ? weather.windSpeedKmh : '--'} km/h</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-bold uppercase">Rainfall</p>
                    <p className="font-bold text-slate-800 flex items-center gap-1"><Droplets className="w-3 h-3 text-slate-400"/> {weather ? weather.rainfallMm : '--'} mm</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Alerts */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" /> Active Alerts
              </h2>
              {alerts.length > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">{alerts.length}</span>
              )}
            </div>
            
            <div className="space-y-3">
              {alerts.length === 0 ? (
                <Card className="bg-slate-50 border-dashed">
                  <CardContent className="p-6 text-center text-slate-500 text-sm font-medium">
                    No active alerts. All systems normal.
                  </CardContent>
                </Card>
              ) : (
                alerts.map((alert) => (
                  <Card key={alert.id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <h4 className="font-bold text-slate-800 text-sm capitalize">{alert.alertType.replace('_', ' ')}</h4>
                      <p className="text-xs text-slate-600 mt-1">{alert.message}</p>
                      <p className="text-[10px] text-slate-400 mt-2 font-medium">{new Date(alert.createdAt).toLocaleString()}</p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
