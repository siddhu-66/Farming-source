import { Card, CardContent } from '@/components/ui/Card';
import { IndianRupee, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function WalletBalanceCard({ data, role }: { data: any, role: string }) {
  if (!data) return null;

  return (
    <Card className="bg-gradient-to-br from-blue-600 to-blue-800 text-white overflow-hidden relative shadow-lg">
      <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
        <ShieldCheck className="w-48 h-48" />
      </div>

      <CardContent className="p-8 relative z-10 flex flex-col md:flex-row justify-between gap-8">
        
        {/* Primary Balance */}
        <div className="space-y-4">
          <p className="text-blue-100 font-medium tracking-wide uppercase text-sm">Available Balance</p>
          <div className="flex items-center">
            <IndianRupee className="w-10 h-10 mr-1 opacity-90" />
            <span className="text-6xl font-bold tracking-tight">{data.availableBalance?.toLocaleString() || 0}</span>
          </div>
          
          <div className="flex gap-4 pt-4">
            <Button variant="secondary" className="bg-white text-blue-700 hover:bg-gray-100 font-bold border-none">
              <ArrowUpRight className="w-4 h-4 mr-2" /> Withdraw
            </Button>
            <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 hover:text-white">
              <ArrowDownRight className="w-4 h-4 mr-2" /> Add Money
            </Button>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="flex flex-col justify-center gap-6 min-w-[200px] border-t md:border-t-0 md:border-l border-white/20 pt-6 md:pt-0 md:pl-8">
          
          <div>
            <div className="flex items-center text-blue-100 text-sm mb-1">
              <Clock className="w-4 h-4 mr-1.5 opacity-70" />
              Pending Settlement
            </div>
            <p className="text-2xl font-semibold flex items-center">
              <IndianRupee className="w-5 h-5 opacity-80 mr-1" />
              {data.pendingBalance?.toLocaleString() || 0}
            </p>
          </div>

          <div>
            <div className="flex items-center text-blue-100 text-sm mb-1">
              <ShieldCheck className="w-4 h-4 mr-1.5 opacity-70" />
              Escrow Locked
            </div>
            <p className="text-2xl font-semibold flex items-center">
              <IndianRupee className="w-5 h-5 opacity-80 mr-1" />
              {data.escrowLocked?.toLocaleString() || 0}
            </p>
          </div>
          
          {role !== 'buyer' && (
            <div>
              <p className="text-blue-100 text-sm mb-1">Lifetime Earnings</p>
              <p className="text-xl font-medium text-blue-50 flex items-center">
                <IndianRupee className="w-4 h-4 opacity-70 mr-1" />
                {data.lifetimeEarnings?.toLocaleString() || 0}
              </p>
            </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
