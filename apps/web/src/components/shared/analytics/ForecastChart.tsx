'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ComposedChart } from 'recharts';
import { TrendingUp } from 'lucide-react';

interface ForecastData {
  month: string;
  expected: number;
  lowerBound: number;
  upperBound: number;
}

export default function ForecastChart({ data, title }: { data: ForecastData[], title: string }) {
  if (!data || data.length === 0) return null;

  return (
    <Card className="border-gray-200 dark:border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-bold flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6b7280' }} />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                formatter={(value: number) => [`${value}`, 'Value']}
              />
              <Area type="monotone" dataKey="upperBound" stroke="none" fill="#10b981" fillOpacity={0.1} />
              <Area type="monotone" dataKey="lowerBound" stroke="none" fill="#ffffff" fillOpacity={1} />
              <Line type="monotone" dataKey="expected" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 text-xs text-center text-gray-500">
          Shaded area represents the 95% confidence interval for projected trends.
        </div>
      </CardContent>
    </Card>
  );
}
