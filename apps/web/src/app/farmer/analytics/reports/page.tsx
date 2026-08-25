"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Download, Mail, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "@/lib/api";

export default function ReportsCenter() {
  const router = useRouter();
  const [exporting, setExporting] = useState(false);
  const [scheduling, setScheduling] = useState(false);

  const handleExport = async (reportType: string, format: string) => {
    setExporting(true);
    try {
      const res = await api.post('/api/v1/analytics/export', { reportType, format });
      if (res.data?.success) {
        toast.success(`Report exported: ${res.data.data.report.fileUrl}`);
      }
    } catch (err) {
      toast.error("Failed to export report");
    } finally {
      setExporting(false);
    }
  };

  const handleSchedule = async (reportType: string) => {
    setScheduling(true);
    try {
      const res = await api.post('/api/v1/analytics/schedule', {
        reportType,
        frequency: 'weekly',
        channels: ['email']
      });
      if (res.data?.success) {
        toast.success("Weekly report scheduled via Email");
      }
    } catch (err) {
      toast.error("Failed to schedule report");
    } finally {
      setScheduling(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Reports Center</h1>
          <p className="text-muted-foreground">Export and schedule your business intelligence reports.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* On-Demand Export */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" /> Export Report
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="p-4 border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Financial Summary</h4>
                  <p className="text-sm text-slate-500">Revenue, expenses, and profit margins.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('financial', 'pdf')} disabled={exporting}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('financial', 'excel')} disabled={exporting}>
                    Excel
                  </Button>
                </div>
              </div>

              <div className="p-4 border rounded-xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-800">Crop Yield Report</h4>
                  <p className="text-sm text-slate-500">Historical harvest data and AI forecasts.</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleExport('yield', 'pdf')} disabled={exporting}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('yield', 'csv')} disabled={exporting}>
                    CSV
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Delivery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" /> Scheduled Deliveries
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
              <h4 className="font-bold text-slate-800 flex items-center gap-2 mb-2">
                <Mail className="w-4 h-4 text-slate-500" /> Weekly Farm Health
              </h4>
              <p className="text-sm text-slate-600 mb-4">Automatically receive a summarized PDF report every Monday at 8:00 AM.</p>
              <Button onClick={() => handleSchedule('farm_health')} disabled={scheduling} className="w-full">
                {scheduling ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Enable Weekly Delivery
              </Button>
            </div>

          </CardContent>
        </Card>

      </div>
    </div>
  );
}
