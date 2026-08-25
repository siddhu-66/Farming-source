import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { Package, Clock, CheckCircle, IndianRupee } from 'lucide-react';

interface OrdersAnalyticsProps {
  data: {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    revenue?: number; // Farmer/Industry total
    spent?: number;   // Buyer total
  } | null;
  loading: boolean;
  role: 'farmer' | 'buyer' | 'industry';
}

export function OrdersAnalytics({ data, loading, role }: OrdersAnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Orders',
      value: data?.totalOrders || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Pending',
      value: data?.pendingOrders || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Completed',
      value: data?.completedOrders || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: role === 'buyer' ? 'Total Spent' : 'Revenue',
      value: data ? formatCurrency(role === 'buyer' ? (data.spent || 0) : (data.revenue || 0)) : '₹0',
      icon: IndianRupee,
      color: role === 'buyer' ? 'text-red-600' : 'text-orange-600',
      bgColor: role === 'buyer' ? 'bg-red-100' : 'bg-orange-100',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <motion.div
          key={card.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-500">{card.title}</p>
                {loading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <p className="text-2xl font-bold">{card.value}</p>
                )}
              </div>
              <div className={`mt-4 md:mt-0 p-3 rounded-full ${card.bgColor} ${card.color}`}>
                <card.icon className="w-5 h-5 md:w-6 md:h-6" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
