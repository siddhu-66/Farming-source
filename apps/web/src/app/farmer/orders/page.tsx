'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Search, Filter, Package } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { OrderCard, Order } from '@/components/shared/orders/OrderCard';
import { OrdersAnalytics } from '@/components/shared/orders/OrdersAnalytics';

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending_farmer', label: 'Action Required' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'payment_completed', label: 'Paid' },
  { id: 'transport_assigned', label: 'Transport' },
  { id: 'in_transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
  { id: 'completed', label: 'Completed' },
  { id: 'cancelled', label: 'Cancelled' },
];

export default function FarmerOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      // Wait for fetchOrders to calculate this locally for now
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { limit: 50 };
      if (activeTab !== 'all') params.status = activeTab;

      const res = await api.get('/orders', { params });
      if (res.data.success) {
        const fetchedOrders = res.data.data.orders || [];
        setOrders(fetchedOrders);
        
        // Calculate basic analytics locally from the fetched orders
        const pending = fetchedOrders.filter((o: any) => o.status === 'pending_farmer').length;
        const completed = fetchedOrders.filter((o: any) => o.status === 'completed').length;
        const revenue = fetchedOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0);
        
        setAnalytics({
          totalOrders: res.data.data.total,
          pendingOrders: pending,
          completedOrders: completed,
          revenue
        });
        setAnalyticsLoading(false);
      }
    } catch (err) {
      toast.error('Failed to load orders');
      console.error(err);
      setAnalyticsLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOrders();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchQuery]);

  const handleConfirm = async (id: string) => {
    try {
      const res = await api.patch(`/orders/${id}/confirm`);
      if (res.data.success) {
        toast.success('Order confirmed!');
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'confirmed' } : o));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to confirm order');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = prompt('Please enter a reason for cancellation/rejection:');
    if (!reason) return;
    try {
      const res = await api.patch(`/orders/${id}/cancel`, { reason });
      if (res.data.success) {
        toast.success('Order rejected/cancelled');
        setOrders(orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
        <h1 className="text-3xl font-bold">Manage Orders</h1>
      </div>

      {/* Analytics Summary */}
      <OrdersAnalytics data={analytics} loading={analyticsLoading} role="farmer" />

      {/* Search & Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input 
              placeholder="Search by Order ID or Crop..." 
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeTab === tab.id 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {tab.label}
              {tab.id === 'pending_farmer' && analytics?.pendingOrders > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {analytics.pendingOrders}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="w-full h-48 rounded-xl" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-900 rounded-xl border">
            <Package className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">No orders found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                userRole="farmer"
                onConfirm={handleConfirm}
                onCancel={handleCancel}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
