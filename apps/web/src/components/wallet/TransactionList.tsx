import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { IndianRupee, ArrowDownLeft, ArrowUpRight, FileText, Download } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/Button';

export function TransactionList({ transactions }: { transactions: any[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-gray-500">
          No recent transactions found.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((txn, index) => (
        <Card key={txn.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Icon & Details */}
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-full ${txn.type === 'CREDIT' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                {txn.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
              </div>
              
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {txn.category}
                  {txn.status === 'PENDING' && (
                    <Badge variant="warning" className="text-[10px] h-5 px-1.5">Pending</Badge>
                  )}
                  {txn.status === 'FAILED' && (
                    <Badge variant="danger" className="text-[10px] h-5 px-1.5">Failed</Badge>
                  )}
                </h4>
                <p className="text-xs text-gray-500 mt-1 font-mono">{txn.id} • {txn.method}</p>
                <p className="text-xs text-gray-400">{format(new Date(txn.date), 'dd MMM yyyy, hh:mm a')}</p>
              </div>
            </div>

            {/* Amount & Invoice */}
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end border-t md:border-none pt-3 md:pt-0 border-gray-100 dark:border-gray-800">
              <div className="text-right">
                <span className={`text-lg font-bold flex items-center justify-end ${txn.type === 'CREDIT' ? 'text-green-600' : 'text-gray-900 dark:text-white'}`}>
                  {txn.type === 'CREDIT' ? '+' : '-'} <IndianRupee className="w-4 h-4 ml-0.5 mr-0.5" /> {txn.amount.toLocaleString()}
                </span>
              </div>
              
              <Button variant="ghost" size="icon" className="text-blue-600 hover:bg-blue-50" title="Download Invoice">
                <Download className="w-4 h-4" />
              </Button>
            </div>
            
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
