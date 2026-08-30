'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function MarketPricesWidget() {
  const [data, setData] = useState<any[] | null>(null);
  useEffect(() => {
    api.get('/farmer/market-prices').then(res => setData(res.data.data)).catch(() => setData([]));
  }, []);

  if (!data) return <Skeleton className="h-64 w-full" />;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Market Prices</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, i) => (
            <div key={i} className="flex justify-between items-center border-b pb-2 last:border-0">
              <div>
                <p className="font-semibold">{item.crop}</p>
                <p className="text-xs text-gray-500">{item.market}</p>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold">₹{item.current}/q</span>
                <span className={`text-xs flex items-center ${item.trend === 'up' ? 'text-green-600' : item.trend === 'down' ? 'text-red-600' : 'text-gray-500'}`}>
                  {item.trend === 'up' && <TrendingUp className="h-3 w-3 mr-1" />}
                  {item.trend === 'down' && <TrendingDown className="h-3 w-3 mr-1" />}
                  {item.trend === 'neutral' && <Minus className="h-3 w-3 mr-1" />}
                  {item.trend === 'up' ? '+' : item.trend === 'down' ? '' : ''}{item.current - item.previous}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
