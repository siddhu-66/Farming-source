"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Thermometer, Droplets, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend
} from 'recharts';
import api from "@/lib/api";

const generateMockData = () => {
  const data = [];
  for (let i = 24; i >= 0; i--) {
    const d = new Date();
    d.setHours(d.getHours() - i);
    data.push({
      time: d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      moisture: 40 + Math.random() * 20,
      temp: 20 + Math.random() * 10,
    });
  }
  return data;
};

export default function SensorAnalytics() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    setData(generateMockData());
  }, []);

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
