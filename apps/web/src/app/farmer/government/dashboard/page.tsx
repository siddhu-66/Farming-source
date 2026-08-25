"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield, FileText, IndianRupee, Bell, ArrowRight, ChevronRight, CheckCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import api from "@/lib/api";

export default function GovernmentDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    activeApplications: number;
    totalSubsidies: number;
    schemes: any[];
  }>({
    activeApplications: 0,
    totalSubsidies: 0,
    schemes: []
  });

  useEffect(() => {
    // In a real app we'd fetch actual dashboard summary data here
    setTimeout(() => {
      setData({
        activeApplications: 2,
        totalSubsidies: 45000,
        schemes: [
          { id: '1', title: 'PM-KISAN Samman Nidhi', status: 'approved' },
          { id: '2', title: 'National Mission on Micro Irrigation', status: 'under_review' }
        ]
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Government Services</h1>
          <p className="text-muted-foreground">Discover schemes, track applications, and manage subsidies.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/farmer/government/schemes">
            <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Schemes</Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white border-none shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-emerald-100">Eligible Schemes</p>
                  <h3 className="text-4xl font-bold mt-2">12</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Shield className="w-6 h-6 text-white" />
                </div>
              </div>
              <Link href="/farmer/government/schemes" className="flex items-center text-sm font-medium mt-6 text-emerald-100 hover:text-white">
                View recommendations <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-t-4 border-t-amber-500 h-full">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-500">Active Applications</p>
                  <h3 className="text-4xl font-bold mt-2 text-slate-800">{loading ? '-' : data.activeApplications}</h3>
                </div>
                <div className="p-3 bg-amber-100 rounded-xl">
                  <FileText className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <Link href="/farmer/government/applications" className="flex items-center text-sm font-medium mt-6 text-amber-600 hover:text-amber-700">
                Track status <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-t-4 border-t-blue-500 h-full">
            <CardContent className="p-6 h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-slate-500">Subsidies Received</p>
                  <h3 className="text-4xl font-bold mt-2 text-slate-800">₹{loading ? '-' : data.totalSubsidies.toLocaleString()}</h3>
                </div>
                <div className="p-3 bg-blue-100 rounded-xl">
                  <IndianRupee className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <Link href="/farmer/government/subsidies" className="flex items-center text-sm font-medium mt-6 text-blue-600 hover:text-blue-700">
                View financials <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <h3 className="font-bold text-lg">Quick Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'AI Eligibility', icon: Shield, color: 'text-purple-600', bg: 'bg-purple-100', href: '/farmer/government/schemes' },
              { label: 'Crop Insurance', icon: FileText, color: 'text-blue-600', bg: 'bg-blue-100', href: '#' },
              { label: 'Agri Loans', icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-100', href: '#' },
              { label: 'Documents', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100', href: '#' },
            ].map((action, i) => (
              <Link key={i} href={action.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer text-center h-full">
                  <CardContent className="p-4 flex flex-col items-center justify-center space-y-3">
                    <div className={`p-3 rounded-full ${action.bg}`}>
                      <action.icon className={`w-6 h-6 ${action.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{action.label}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {/* Recent Applications */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Recent Applications</CardTitle>
              <Link href="/farmer/government/applications" className="text-sm text-emerald-600 font-medium hover:underline">View All</Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-lg"></div>)}
                </div>
              ) : (
                <div className="space-y-4">
                  {data.schemes.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${s.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                          {s.status === 'approved' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{s.title}</h4>
                          <p className="text-sm text-slate-500 capitalize">{s.status.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Notifications */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-emerald-600" /> Reminders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 border-l-4 border-l-amber-500 bg-amber-50 rounded-r-lg">
                  <h4 className="font-bold text-sm text-amber-800">Renewal Due</h4>
                  <p className="text-xs text-amber-700 mt-1">Your PMFBY crop insurance needs renewal before Oct 31.</p>
                </div>
                <div className="p-3 border-l-4 border-l-emerald-500 bg-emerald-50 rounded-r-lg">
                  <h4 className="font-bold text-sm text-emerald-800">New Scheme Match</h4>
                  <p className="text-xs text-emerald-700 mt-1">Solar Pump Subsidy (KUSUM) matches your profile.</p>
                </div>
                <div className="p-3 border-l-4 border-l-blue-500 bg-blue-50 rounded-r-lg">
                  <h4 className="font-bold text-sm text-blue-800">Subsidy Credited</h4>
                  <p className="text-xs text-blue-700 mt-1">₹2,000 credited to bank ending in x4532.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
