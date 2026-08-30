'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { ArrowLeft, Wallet, Building2, Send, Download, History, CreditCard, BarChart3, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/stores/authStore';
import { WalletBalanceCard } from '@/components/wallet/WalletBalanceCard';
import { TransactionList } from '@/components/wallet/TransactionList';

export default function WalletDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [walletData, setWalletData] = useState<any>(null);
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    const fetchWalletData = async () => {
      try {
        const [walletRes, txnsRes] = await Promise.all([
          api.get('/wallet'),
          api.get('/wallet/transactions')
        ]);
        setWalletData(walletRes.data.data);
        setTransactions(txnsRes.data.data.transactions);
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to load wallet data');
      } finally {
        setLoading(false);
      }
    };
    fetchWalletData();
  }, []);

  const handleWithdraw = async () => {
    toast.success('Withdrawal initiated! Processing can take up to 2 hours.');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-24 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} className="p-2 -ml-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Wallet className="w-8 h-8 text-blue-600" />
              Wallet & Finance
            </h1>
            <p className="text-gray-500 mt-1">Manage your earnings, payments, and settlements.</p>
          </div>
        </div>
      </div>

      {/* Main Balance Area */}
      {loading ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : (
        <WalletBalanceCard data={walletData} role={user?.role || 'farmer'} />
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: Building2, label: 'Bank Accounts', color: 'text-indigo-500', bg: 'bg-indigo-100', action: () => toast('Manage Bank Accounts') },
          { icon: Send, label: 'Transfer Funds', color: 'text-teal-500', bg: 'bg-teal-100', action: () => toast('Transfer Funds') },
          { icon: Download, label: 'Invoices', color: 'text-rose-500', bg: 'bg-rose-100', action: () => toast('View Invoices') },
          { icon: BarChart3, label: 'Reports', color: 'text-amber-500', bg: 'bg-amber-100', action: () => toast('Financial Reports') },
        ].map((item, idx) => (
          <button 
            key={idx} 
            onClick={item.action}
            className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border rounded-xl hover:border-blue-500/50 hover:shadow-sm transition-all"
          >
            <div className={`p-3 rounded-full mb-3 ${item.bg} ${item.color}`}>
              <item.icon className="w-5 h-5" />
            </div>
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{item.label}</span>
          </button>
        ))}
      </div>

      {/* Financial Analytics & Stats (Mock view) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col - Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <History className="w-5 h-5 text-gray-500" />
              Recent Transactions
            </h3>
            <Button variant="ghost" className="text-blue-600">View All</Button>
          </div>
          
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : (
            <TransactionList transactions={transactions} />
          )}
        </div>

        {/* Right Col - Information */}
        <div className="space-y-6">
          <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 border-indigo-100 dark:border-indigo-900">
            <CardContent className="p-6">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5" />
                Escrow Protection
              </h4>
              <p className="text-sm text-indigo-800 dark:text-indigo-200">
                AgriAssist securely holds payments in escrow until crops are delivered and verified, protecting both buyers and sellers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-gray-500" />
                Primary Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="w-12 h-12 bg-white dark:bg-gray-900 rounded shadow-sm flex items-center justify-center font-bold text-blue-600">
                  HDFC
                </div>
                <div>
                  <p className="font-semibold">HDFC Bank</p>
                  <p className="text-sm text-gray-500">•••• •••• 4321</p>
                </div>
              </div>
              <Button variant="outline" className="w-full mt-4">Manage Accounts</Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </motion.div>
  );
}
