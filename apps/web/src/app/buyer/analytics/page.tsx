'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { 
  ShoppingCart, TrendingUp, Package, RefreshCw, ArrowLeft, Download, Truck, Activity
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import ReportBuilder from '@/components/shared/analytics/ReportBuilder';
import KPIAlerts from '@/components/shared/analytics/KPIAlerts';
import ForecastChart from '@/components/shared/analytics/ForecastChart';

export default function BuyerAnalytics() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [kpiData, setKpiData] = useState<any>(null);
  const [forecastData, setForecastData] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dashRes, kpiRes, forecastRes, alertsRes] = await Promise.all([
        api.get('/api/analytics/dashboard'),
        api.get('/api/analytics/kpis'),
        api.get('/api/analytics/forecast'),
        api.get('/api/analytics/alerts')
      ]);
      
      setDashboardData(dashRes.data.data);
      setKpiData(kpiRes.data.data.chartData);
      setForecastData(forecastRes.data.data.forecastData);
      setAlerts(alertsRes.data.data.alerts);
    } catch (e) {
      toast.error('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 h-screen overflow-hidden">
      <Skeleton className="h-12 w-64" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32" />)}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 h-full flex flex-col">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-4 mb-2">
          <Button variant="ghost" onClick={() => router.back()} size="sm" className="-ml-2">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
              <ShoppingCart className="mr-3 h-8 w-8 text-primary" /> Purchase Analytics
            </h1>
            <p className="text-gray-500 mt-1">Monitor procurement volume and order success rates.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" size="icon" className="rounded-full" onClick={fetchData}>
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button className="bg-primary text-white">
              <Download className="w-4 h-4 mr-2" /> Export Report
            </Button>
          </div>
        </div>
      </div>

      {/* Global KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Purchase Volume</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {dashboardData?.kpis?.purchaseVolume}
                </h3>
              </div>
              <div className="p-3 bg-blue-100 text-blue-600 rounded-lg">
                <Package className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-blue-600 font-medium">
              <TrendingUp className="w-4 h-4 mr-1" /> +5% vs last month
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Avg Purchase Value</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {dashboardData?.kpis?.avgPurchaseValue}
                </h3>
              </div>
              <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                <ShoppingCart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              Per Order Average
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Delivery Success</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {dashboardData?.kpis?.deliverySuccess}
                </h3>
              </div>
              <div className="p-3 bg-purple-100 text-purple-600 rounded-lg">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-purple-600 font-medium">
              <Activity className="w-4 h-4 mr-1" /> Highly Reliable
            </div>
          </CardContent>
        </Card>

        <Card className="border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-gray-500">Active Orders</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  {dashboardData?.kpis?.activeOrders}
                </h3>
              </div>
              <div className="p-3 bg-orange-100 text-orange-600 rounded-lg">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              In transit or pending
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Analysis Chart */}
        <div className="lg:col-span-2">
          <Card className="border-gray-200 dark:border-gray-800 h-full">
            <CardHeader>
              <CardTitle className="text-lg">Purchase Volume Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kpiData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                    <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                    <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                    />
                    <Line type="monotone" dataKey="value2" name="Volume (Tons)" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar: Alerts & Reports */}
        <div className="space-y-6">
          <KPIAlerts alerts={alerts} />
          <ReportBuilder />
        </div>
      </div>

      {/* Forecasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ForecastChart data={forecastData} title="Spend Forecast (₹k)" />
        
        <Card className="border-gray-200 dark:border-gray-800">
          <CardHeader>
            <CardTitle className="text-lg">Category Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={kpiData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                  <YAxis tick={{fill: '#6b7280', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="value1" name="Vegetables" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="value2" name="Fruits" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
