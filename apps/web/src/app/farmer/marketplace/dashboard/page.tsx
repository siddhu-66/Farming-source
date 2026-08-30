"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Store, TrendingUp, PackageSearch, AlertCircle, 
  CreditCard, Truck, FileText, Bell, Sparkles
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import api from "@/lib/api";

export default function MarketplaceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/api/farmer/listings/analytics');
        if (res.data?.success) {
          setStats(res.data.data);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-emerald-600">Active Listings</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? "-" : stats?.activeListings || 0}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600">
                <Store className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-blue-600">Pending Offers</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? "-" : "3"} {/* Mock */}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
                <AlertCircle className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border-purple-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-purple-600">Active Orders</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  {loading ? "-" : "2"} {/* Mock */}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
                <PackageSearch className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-100">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-amber-600">Est. Revenue</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-2">
                  ₹{loading ? "-" : (stats?.estimatedRevenue || 0).toLocaleString()}
                </h3>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg text-amber-600">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* AI Insights & Market Trends */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                AI Market Intelligence
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 border border-purple-100 rounded-lg flex items-start gap-4">
                  <TrendingUp className="w-6 h-6 text-purple-600 shrink-0 mt-1" />
                  <div>
                    <h4 className="font-semibold text-purple-900">Wheat Prices Surging</h4>
                    <p className="text-sm text-purple-700 mt-1">
                      Based on current market trends, Premium Grade Wheat is seeing a 15% price increase in your region. Consider listing your stock this week.
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Highest Demand</p>
                    <p className="text-lg font-semibold mt-1">Organic Tomatoes</p>
                    <p className="text-sm text-emerald-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4" /> +12% vs last month
                    </p>
                  </div>
                  <div className="border p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Nearby Buyer Requests</p>
                    <p className="text-lg font-semibold mt-1">5 active requests</p>
                    <p className="text-sm text-blue-600 mt-1">Match with your inventory</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-medium">Payment Received</p>
                        <p className="text-sm text-muted-foreground">Order #ORD-{9823 + i}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600">+₹45,000</p>
                      <p className="text-xs text-muted-foreground">Today</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Operations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-blue-500" />
                    <span className="font-medium">Active Contracts</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">2</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-amber-500" />
                    <span className="font-medium">Deliveries in Transit</span>
                  </div>
                  <span className="bg-slate-100 px-2 py-1 rounded text-sm font-semibold">1</span>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <PackageSearch className="w-5 h-5 text-emerald-500" />
                    <span className="font-medium">Inventory Alerts</span>
                  </div>
                  <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-sm font-semibold">1</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle>Recent Activity</CardTitle>
              <Bell className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4 mt-4">
                <div className="flex gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">New Offer Received</p>
                    <p className="text-xs text-muted-foreground">AgriCorp offered ₹2,400/quintal for Wheat.</p>
                  </div>
                </div>
                <div className="flex gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Contract Signed</p>
                    <p className="text-xs text-muted-foreground">GreenFoods accepted your terms.</p>
                  </div>
                </div>
                <div className="flex gap-3 relative">
                  <div className="w-2 h-2 rounded-full bg-amber-500 mt-2 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium">Listing Expiring</p>
                    <p className="text-xs text-muted-foreground">Organic Tomatoes listing expires in 2 days.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
