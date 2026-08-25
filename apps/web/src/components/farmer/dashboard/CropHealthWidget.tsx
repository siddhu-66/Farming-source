'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Activity, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function CropHealthWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get('/api/farmer/crops/health').then(res => setData(res.data.data)).catch(() => setData({}));
  }, []);

  if (!data) return <Skeleton className="h-48 w-full" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Activity className="w-5 h-5 mr-2"/> Crop Health Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-around mb-4">
          <div className="text-center">
            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.healthy}</p>
            <p className="text-xs text-gray-500">Healthy</p>
          </div>
          <div className="text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.diseased}</p>
            <p className="text-xs text-gray-500">Diseased</p>
          </div>
          <div className="text-center">
            <Clock className="w-8 h-8 text-amber-500 mx-auto mb-1" />
            <p className="text-2xl font-bold">{data.pending}</p>
            <p className="text-xs text-gray-500">Pending</p>
          </div>
        </div>
        {data.alerts && data.alerts.length > 0 && (
          <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-sm text-red-800 dark:text-red-200">
            <span className="font-semibold">Alert:</span> {data.alerts[0]}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
