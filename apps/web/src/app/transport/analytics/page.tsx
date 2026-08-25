"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { TrendingUp, Truck, Users, Clock } from "lucide-react";

const revenueData = [
  { name: 'Jan', revenue: 40000 },
  { name: 'Feb', revenue: 30000 },
  { name: 'Mar', revenue: 20000 },
  { name: 'Apr', revenue: 27800 },
  { name: 'May', revenue: 18900 },
  { name: 'Jun', revenue: 23900 },
  { name: 'Jul', revenue: 34900 },
];

const tripsData = [
  { name: 'Mon', completed: 12, cancelled: 1 },
  { name: 'Tue', completed: 15, cancelled: 0 },
  { name: 'Wed', completed: 11, cancelled: 2 },
  { name: 'Thu', completed: 18, cancelled: 1 },
  { name: 'Fri', completed: 22, cancelled: 0 },
  { name: 'Sat', completed: 25, cancelled: 1 },
  { name: 'Sun', completed: 10, cancelled: 0 },
];

export default function AnalyticsHub() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold">Analytics Hub</h1>
        <p className="text-muted-foreground">Detailed insights into fleet performance, driver metrics, and revenue.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-emerald-100">Total Revenue</p>
                <h3 className="text-3xl font-bold mt-2">₹1,95,500</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-emerald-200" />
            </div>
            <p className="text-sm text-emerald-100 mt-4">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Fleet Utilization</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">85%</h3>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-emerald-600 mt-4 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> +5% optimization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Active Drivers</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">24</h3>
              </div>
              <Users className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm text-slate-500 mt-4">Out of 28 registered</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Avg. Delivery Time</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">4.2 Hrs</h3>
              </div>
              <Clock className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-sm text-emerald-600 mt-4 font-medium flex items-center gap-1">
              <TrendingUp className="w-4 h-4" /> 15 mins faster
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value/1000}k`} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Weekly Trips (Completed vs Cancelled)</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tripsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <RechartsTooltip />
                <Bar dataKey="completed" stackId="a" fill="#3b82f6" radius={[0, 0, 4, 4]} />
                <Bar dataKey="cancelled" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
