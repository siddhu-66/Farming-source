'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '@/lib/api';
import { Skeleton } from '@/components/ui/Skeleton';

export function WalletSummaryWidget() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api.get('/farmer/wallet/summary').then(res => setData(res.data.data)).catch(() => setData({}));
  }, []);

  if (!data) return <Skeleton className="h-48 w-full" />;
  return (
    <Card className="bg-emerald-600 text-white">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center font-normal opacity-90"><Wallet className="w-5 h-5 mr-2"/> Wallet Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h2 className="text-4xl font-bold">₹{data.balance?.toLocaleString('en-IN')}</h2>
          <p className="text-sm opacity-80 mt-1">Pending: ₹{data.pending?.toLocaleString('en-IN')}</p>
        </div>
        <div className="space-y-2 text-sm">
          {data.recent?.map((txn:any, i:number) => (
            <div key={i} className="flex justify-between items-center bg-white/10 p-2 rounded">
              <span className="flex items-center">
                {txn.type === 'credit' ? <ArrowDownRight className="w-4 h-4 mr-1 text-green-300"/> : <ArrowUpRight className="w-4 h-4 mr-1 text-red-300"/>}
                {txn.desc}
              </span>
              <span className="font-bold">{txn.type === 'credit' ? '+' : '-'}₹{txn.amount}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
