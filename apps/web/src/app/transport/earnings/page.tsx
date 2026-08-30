'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, DollarSign, TrendingUp, Package, Loader2, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface MonthlyEarning {
  _id: { year: number; month: number };
  earnings: number;
  trips: number;
}

interface Analytics {
  overview: {
    totalBookings: number;
    completedBookings: number;
    totalVehicles: number;
    totalEarnings: number;
  };
  monthlyEarnings: MonthlyEarning[];
}

export default function EarningsPage() {
  const router = useRouter();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const response = await api.get('/transport/analytics');
        if (response.data.success) {
          setAnalytics(response.data.data);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch earnings data');
      } finally {
        setLoading(false);
      }
    };

    fetchEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Earnings</h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Earnings</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center bg-red-50 rounded-xl border border-dashed border-red-200"
        >
          <h2 className="text-xl font-medium text-gray-700">Failed to Load Data</h2>
          <p className="text-gray-500 mt-2">Unable to fetch earnings information.</p>
        </motion.div>
      </div>
    );
  }

  const { overview, monthlyEarnings } = analytics;
  const averageEarningsPerTrip = overview.completedBookings > 0
    ? overview.totalEarnings / overview.completedBookings
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Earnings</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(overview.totalEarnings)}</h3>
              <p className="text-xs text-gray-500 mt-2">All time earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-green-200 bg-gradient-to-br from-green-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Completed Trips</p>
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Package className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{overview.completedBookings}</h3>
              <p className="text-xs text-gray-500 mt-2">Successfully delivered</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Avg per Trip</p>
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{formatCurrency(averageEarningsPerTrip)}</h3>
              <p className="text-xs text-gray-500 mt-2">Average earnings</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
              </div>
              <h3 className="text-3xl font-bold text-gray-900">{overview.totalBookings}</h3>
              <p className="text-xs text-gray-500 mt-2">All bookings</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-6">Monthly Earnings Breakdown</h2>

            {monthlyEarnings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No earnings data available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {monthlyEarnings.map((month, index) => (
                  <motion.div
                    key={`${month._id.year}-${month._id.month}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-orange-600">
                          {getMonthName(month._id.month)}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">
                          {getMonthName(month._id.month)} {month._id.year}
                        </p>
                        <p className="text-sm text-gray-500">{month.trips} trips completed</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{formatCurrency(month.earnings)}</p>
                      <p className="text-xs text-gray-500">
                        {formatCurrency(month.earnings / month.trips)} avg
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
