"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Truck, Map, Box, IndianRupee, Clock, Activity, CheckCircle, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import api from "@/lib/api";
import { toast } from "react-hot-toast";

export default function TransportDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        // We can use the existing analytics/dashboard endpoints
        const res = await api.get('/api/transport/analytics');
        if (res.data?.success) {
          setStats(res.data.data.overview);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const kpis = [
    { title: "Active Bookings", value: stats?.totalBookings || "0", icon: <Package className="w-6 h-6 text-orange-600" />, bg: "bg-orange-100" },
    { title: "Nearby Vehicles", value: stats?.totalVehicles || "0", icon: <Truck className="w-6 h-6 text-blue-600" />, bg: "bg-blue-100" },
    { title: "Completed Deliveries", value: stats?.completedBookings || "0", icon: <CheckCircle className="w-6 h-6 text-emerald-600" />, bg: "bg-emerald-100" },
    { title: "Total Revenue", value: `₹${(stats?.totalEarnings || 0).toLocaleString()}`, icon: <IndianRupee className="w-6 h-6 text-purple-600" />, bg: "bg-purple-100" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Transport Dashboard</h1>
          <p className="text-muted-foreground">Manage your fleet, track active bookings, and optimize logistics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-6 flex items-center gap-4">
                <div className={`w-12 h-12 ${kpi.bg} rounded-full flex items-center justify-center shrink-0`}>
                  {kpi.icon}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">{kpi.title}</p>
                  {loading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <h3 className="text-2xl font-bold mt-1">{kpi.value}</h3>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Map Placeholder */}
        <motion.div 
          className="lg:col-span-2"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full min-h-[400px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="w-5 h-5 text-orange-600" />
                Live Fleet Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 relative bg-slate-100 flex items-center justify-center overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[url('https://maps.wikimedia.org/osm-intl/12/2924/1676.png')] bg-cover bg-center"></div>
              
              {/* Simulated moving trucks */}
              <motion.div 
                className="absolute w-8 h-8 bg-orange-600 text-white rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  x: [0, 50, 100, 150, 100, 50, 0],
                  y: [0, -20, 10, -30, 20, 0, 0]
                }}
                transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
              >
                <Truck className="w-4 h-4" />
              </motion.div>
              <motion.div 
                className="absolute w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg"
                animate={{ 
                  x: [100, 50, -50, -100, -50, 50, 100],
                  y: [-50, 20, -10, 30, -20, -50, -50]
                }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
              >
                <Truck className="w-4 h-4" />
              </motion.div>

              <div className="relative z-10 bg-white/90 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-slate-200 flex flex-col items-center">
                <Activity className="w-8 h-8 text-orange-500 mb-2 animate-pulse" />
                <h4 className="font-bold">Live GPS Active</h4>
                <p className="text-sm text-slate-500">2 vehicles currently en route</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Freight Calculator Widget */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="h-full border-t-4 border-t-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-orange-600" />
                Quick Freight Estimator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Distance (km)</label>
                <input type="number" defaultValue={150} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Weight (kg)</label>
                <input type="number" defaultValue={2500} className="w-full p-2 border rounded-md" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Vehicle Type</label>
                <select className="w-full p-2 border rounded-md bg-white">
                  <option>Mini Truck (Tata Ace)</option>
                  <option>3 Ton Truck</option>
                  <option>10 Ton Truck</option>
                </select>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100 mt-4">
                <div className="flex justify-between text-sm mb-1 text-orange-800">
                  <span>Base Rate</span>
                  <span>₹2,250</span>
                </div>
                <div className="flex justify-between text-sm mb-1 text-orange-800">
                  <span>Weight Surcharge</span>
                  <span>₹1,000</span>
                </div>
                <div className="flex justify-between font-bold text-lg mt-2 pt-2 border-t border-orange-200 text-orange-900">
                  <span>Estimated Total</span>
                  <span>₹3,250</span>
                </div>
              </div>

              <button className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 rounded-lg transition-colors">
                Calculate Exact Fare
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
