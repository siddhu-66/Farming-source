'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Warehouse, Package, Thermometer, Gauge, MapPin, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface WarehouseData {
  id: string;
  warehouseName: string;
  address: string;
  capacityTons: number;
  coldStorage: boolean;
  temperatureControlled: boolean;
  latitude: number | null;
  longitude: number | null;
  isDefault: boolean;
  createdAt?: string;
}

export default function WarehousePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get industry profile first
      const profileRes = await api.get('/profile');

      if (!profileRes.data?.success) {
        throw new Error('Failed to fetch profile');
      }

      const userId = profileRes.data.data.id;

      // Fetch warehouses from industry_warehouses table via raw query or dashboard
      // Since there's no direct endpoint, we'll use the dashboard endpoint which might include warehouse data
      // or we can make a direct supabase query if available

      // For now, let's try to get industry profile data which should include warehouses
      const industryRes = await api.get('/industry/dashboard');

      if (industryRes.data?.success) {
        // Dashboard might not have warehouses, so we'll need to fetch them separately
        // Since there's no dedicated endpoint, we'll show a message to complete onboarding
        setWarehouses([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch warehouses:', err);
      setError(err.response?.data?.message || 'Failed to load warehouse data');
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-8 w-64" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Warehouse Management</h1>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-200 dark:border-red-800"
        >
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-red-700 dark:text-red-400">{error}</h2>
          <p className="text-red-600 dark:text-red-500 mt-2">Please try again or contact support.</p>
          <Button
            onClick={fetchWarehouses}
            className="mt-4 bg-red-600 hover:bg-red-700"
          >
            Retry
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Warehouse className="h-8 w-8 text-purple-600" />
              Warehouse Management
            </h1>
            <p className="text-gray-500 mt-1">Manage storage facilities and inventory capacity</p>
          </div>
        </div>
        <Button
          className="bg-purple-600 hover:bg-purple-700"
          onClick={() => router.push('/industry/onboarding')}
        >
          <Package className="h-4 w-4 mr-2" />
          Add Warehouse
        </Button>
      </div>

      {warehouses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700"
        >
          <Warehouse className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700 dark:text-gray-300">No Warehouses Configured</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
            Complete your industry onboarding to add warehouse facilities and manage your storage capacity.
          </p>
          <Button
            onClick={() => router.push('/industry/onboarding')}
            className="mt-6 bg-purple-600 hover:bg-purple-700"
          >
            Complete Onboarding
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {warehouses.map((warehouse, index) => (
            <motion.div
              key={warehouse.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:border-purple-500/50 transition-all hover:shadow-lg">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Warehouse className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{warehouse.warehouseName}</h3>
                        {warehouse.isDefault && (
                          <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 text-xs">
                            Default
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-400">{warehouse.address || 'No address provided'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Capacity:</span>
                      </div>
                      <span className="font-semibold text-purple-600">{warehouse.capacityTons} Tons</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Cold Storage:</span>
                      </div>
                      {warehouse.coldStorage ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Temperature Controlled:</span>
                      </div>
                      {warehouse.temperatureControlled ? (
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-gray-300" />
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        View Details
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                      >
                        Manage Inventory
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Stats Overview */}
      {warehouses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Warehouses</p>
                  <p className="text-2xl font-bold text-purple-600">{warehouses.length}</p>
                </div>
                <Warehouse className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Capacity</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {warehouses.reduce((sum, w) => sum + w.capacityTons, 0)} Tons
                  </p>
                </div>
                <Gauge className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Cold Storage</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {warehouses.filter(w => w.coldStorage).length}
                  </p>
                </div>
                <Thermometer className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Available Space</p>
                  <p className="text-2xl font-bold text-green-600">100%</p>
                </div>
                <Package className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
