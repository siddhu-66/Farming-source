'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Brain, Droplets, Wind, AlertTriangle, Sprout } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export function AiRecommendationWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.post('/api/farmer/ml/dashboard-recommendations').then(res => setData(res.data.data)).catch(() => setData({}));
  }, []);

  if (!data) return <Skeleton className="h-64 w-full" />;
  return (
    <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-200 dark:border-green-800">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-green-700 dark:text-green-400">
          <Brain className="mr-2 h-5 w-5" /> AI Farm Advisor
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 p-3 rounded-lg shadow-sm border border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium">{data.advice}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-start space-x-2 text-sm"><Sprout className="h-4 w-4 text-green-600 mt-0.5" /><span>{data.recommendedCrop}</span></div>
            <div className="flex items-start space-x-2 text-sm"><AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" /><span>{data.diseaseAlert}</span></div>
            <div className="flex items-start space-x-2 text-sm"><Wind className="h-4 w-4 text-blue-500 mt-0.5" /><span>{data.weatherWarning}</span></div>
            <div className="flex items-start space-x-2 text-sm"><Droplets className="h-4 w-4 text-blue-400 mt-0.5" /><span>{data.waterRecommendation}</span></div>
          </div>
          <Button variant="outline" className="w-full mt-2">Ask AI Assistant</Button>
        </div>
      </CardContent>
    </Card>
  );
}
