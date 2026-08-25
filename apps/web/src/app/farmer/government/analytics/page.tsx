"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { IndianRupee, TrendingUp, ShieldCheck, Landmark, ArrowUpRight, ArrowDownRight } from "lucide-react";
import api from "@/lib/api";

const cashFlowData = [
  { month: 'Jan', inflows: 12000, outflows: 4500 },
  { month: 'Feb', inflows: 0, outflows: 4500 },
  { month: 'Mar', inflows: 8000, outflows: 4500 },
  { month: 'Apr', inflows: 25000, outflows: 12000 },
  { month: 'May', inflows: 0, outflows: 12000 },
  { month: 'Jun', inflows: 15000, outflows: 12000 },
];

const portfolioData = [
  { name: 'Crop Insurance', value: 500000 },
  { name: 'Active Loans', value: 250000 },
  { name: 'Subsidies Received', value: 45000 },
];

const COLORS = ['#10b981', '#6366f1', '#f59e0b'];

export default function FinancialAnalytics() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching analytics data
    setTimeout(() => {
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Financial Analytics</h1>
        <p className="text-muted-foreground">Comprehensive insights into your agricultural finances and cash flow.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-emerald-100">Total Net Worth</p>
                <h3 className="text-3xl font-bold mt-2">₹12.5L</h3>
              </div>
              <IndianRupee className="w-8 h-8 text-emerald-200" />
            </div>
            <p className="text-sm text-emerald-100 mt-4 flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> +15% from last year
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Total Liabilities (Loans)</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">₹2.5L</h3>
              </div>
              <Landmark className="w-8 h-8 text-indigo-500" />
            </div>
            <p className="text-sm text-indigo-600 mt-4 font-medium flex items-center gap-1">
              <ArrowDownRight className="w-4 h-4" /> Debt-to-Asset ratio: 20%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Risk Coverage</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">₹5.0L</h3>
              </div>
              <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <p className="text-sm text-slate-500 mt-4">Active Crop Insurance</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-slate-500">Gov. Assistance YTD</p>
                <h3 className="text-3xl font-bold mt-2 text-slate-800">₹45K</h3>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-500" />
            </div>
            <p className="text-sm text-emerald-600 mt-4 font-medium flex items-center gap-1">
              <ArrowUpRight className="w-4 h-4" /> Subsidies & Benefits
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cash Flow Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Cash Flow</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v/1000}k`} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Legend />
                <Bar dataKey="inflows" name="Inflows (Sales, Subsidies)" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="outflows" name="Outflows (EMI, Expenses)" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Financial Portfolio */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Portfolio Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px] flex items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={portfolioData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {portfolioData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} />
                <Legend layout="vertical" verticalAlign="middle" align="right" />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
