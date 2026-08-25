'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Truck, MapPin, Phone } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';

export function TransportStatusWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get('/api/farmer/transport/active').then(res => setData(res.data.data)).catch(() => setData(null));
  }, []);

  if (!data) return <Skeleton className="h-48 w-full" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center text-amber-700"><Truck className="w-5 h-5 mr-2"/> Transport Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <p className="font-semibold">{data.driverName}</p>
            <p className="text-sm text-gray-500">{data.vehicle}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-amber-600">ETA: {data.eta}</p>
            <p className="text-xs text-gray-500">{data.distance}</p>
          </div>
        </div>
        <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium text-amber-800 dark:text-amber-200">{data.status}</span>
          <div className="flex space-x-2">
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full"><Phone className="w-3 h-3"/></Button>
            <Button size="icon" variant="outline" className="h-8 w-8 rounded-full"><MapPin className="w-3 h-3"/></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
