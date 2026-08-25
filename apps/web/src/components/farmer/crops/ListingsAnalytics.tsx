import { Card, CardContent } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { motion } from 'framer-motion';
import { List, CheckCircle, ShoppingCart, IndianRupee } from 'lucide-react';

interface ListingsAnalyticsProps {
  data: {
    totalListings: number;
    activeListings: number;
    soldListings: number;
    estimatedRevenue: number;
  } | null;
  loading: boolean;
}

export function ListingsAnalytics({ data, loading }: ListingsAnalyticsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Listings',
      value: data?.totalListings || 0,
      icon: List,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Active Listings',
      value: data?.activeListings || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Sold Listings',
      value: data?.soldListings || 0,
      icon: ShoppingCart,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'Revenue',
      value: data ? formatCurrency(data.estimatedRevenue) : '₹0',
      icon: IndianRupee,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
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
