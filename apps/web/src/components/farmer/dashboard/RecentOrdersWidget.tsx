'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Package } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';

export function RecentOrdersWidget() {
  const [data, setData] = useState<any[] | null>(null);
  useEffect(() => {
    api.get('/farmer/orders/recent').then(res => setData(res.data.data)).catch(() => setData([]));
  }, []);

  if (!data) return <Skeleton className="h-64 w-full" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center"><Package className="w-5 h-5 mr-2"/> Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((order, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-3 last:border-0">
              <div>
                <p className="font-medium">{order.buyer}</p>
                <p className="text-xs text-gray-500">{order.crop} • {order.quantity}</p>
              </div>
              <Badge variant={order.status === 'Pending' ? 'warning' : 'success'} className={order.status === 'Accepted' ? 'bg-green-500 text-white hover:bg-green-600' : ''}>
                {order.status}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
