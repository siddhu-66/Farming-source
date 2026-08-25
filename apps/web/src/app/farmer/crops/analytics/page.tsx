"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";
import { Activity, Droplets, Target, TrendingUp } from "lucide-react";

// Mock Data for Analytics
const yieldData = [
  { month: "Jan", actual: 12, predicted: 14 },
  { month: "Feb", actual: 15, predicted: 16 },
  { month: "Mar", actual: 18, predicted: 18 },
  { month: "Apr", actual: 20, predicted: 22 },
  { month: "May", actual: 25, predicted: 24 },
  { month: "Jun", actual: 30, predicted: 32 },
];

const healthData = [
  { stage: "Sowing", score: 95 },
  { stage: "Vegetative", score: 88 },
  { stage: "Flowering", score: 92 },
  { stage: "Fruiting", score: 85 },
  { stage: "Harvesting", score: 90 },
];

const costData = [
  { category: "Seeds", value: 5000 },
  { category: "Fertilizer", value: 12000 },
  { category: "Labor", value: 8000 },
  { category: "Irrigation", value: 3000 },
  { category: "Pest Control", value: 4500 },
];

export default function CropAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
            Farm-wide Analytics
          </h2>
          <p className="text-muted-foreground">Comprehensive insights across all your active crops.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Yield Prediction Trend */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" /> Yield Trends (Actual vs Predicted)
            </CardTitle>
            <CardDescription>Monthly yield output compared to AI predictions (in Tons).</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={yieldData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="actual" name="Actual Yield" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="predicted" name="Predicted Yield" stroke="#8b5cf6" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Health Score by Stage */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" /> Average Health by Stage
            </CardTitle>
            <CardDescription>Average crop health score across different growth stages.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={healthData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" />
                <YAxis domain={[0, 100]} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="score" name="Health Score" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Cost Analysis */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" /> Cost Distribution
            </CardTitle>
            <CardDescription>Breakdown of operational costs across the farm.</CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                <XAxis type="number" />
                <YAxis dataKey="category" type="category" />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" name="Cost (₹)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
