"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, User, Phone, Star, Truck, Loader2, Circle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import toast from "react-hot-toast";

interface Driver {
  id: string;
  name: string;
  phone: string;
  status: 'available' | 'on_trip' | 'off_duty';
  rating: number;
  trips: number;
  vehicleAssigned: string | null;
}

export default function DriverPortal() {
  const router = useRouter();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const response = await api.get('/transport/drivers');
        if (response.data.success) {
          setDrivers(response.data.data.drivers || []);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch drivers');
      } finally {
        setLoading(false);
      }
    };

    fetchDrivers();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'on_trip':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'off_duty':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500';
      case 'on_trip':
        return 'bg-orange-500';
      case 'off_duty':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Drivers</h1>
        </div>
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
        </div>
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
          <h1 className="text-3xl font-bold">Drivers</h1>
        </div>
        <div className="text-sm text-gray-500">
          {drivers.length} driver{drivers.length !== 1 ? 's' : ''} total
        </div>
      </div>

      {drivers.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center bg-orange-50 rounded-xl border border-dashed border-orange-200"
        >
          <User className="h-12 w-12 text-orange-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No Drivers Found</h2>
          <p className="text-gray-500 mt-2">Add drivers to manage your fleet.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {drivers.map((driver, index) => (
            <motion.div
              key={driver.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-orange-200 hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-lg">
                        {driver.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{driver.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium text-gray-700">{driver.rating}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className={`w-2 h-2 rounded-full ${getStatusDotColor(driver.status)}`} />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span>{driver.phone}</span>
                    </div>

                    {driver.vehicleAssigned && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Truck className="h-4 w-4 text-gray-400" />
                        <span>{driver.vehicleAssigned}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <span className="text-xs text-gray-500">{driver.trips} trips</span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${getStatusColor(driver.status)}`}>
                        {formatStatus(driver.status)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
