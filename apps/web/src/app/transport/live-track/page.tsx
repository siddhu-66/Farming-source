'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Truck, Package, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Booking {
  id: string;
  orderId: string;
  status: string;
  origin: { address: string; lat: number; lng: number };
  destination: { address: string; lat: number; lng: number };
  currentLocation?: { lat: number; lng: number };
  vehicle?: { registrationNumber: string; type: string };
  farmer?: { name: string; phone: string };
  estimatedDelivery?: string;
  cargo?: { type: string; weight: number; unit: string };
}

export default function LiveTrackPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActiveBookings = async () => {
    try {
      const response = await api.get('/transport/bookings?status=in_transit');
      if (response.data.success) {
        setBookings(response.data.data.bookings || []);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch active bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActiveBookings();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchActiveBookings();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Live Track</h1>
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
          <h1 className="text-3xl font-bold">Live Track</h1>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={refreshing}
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center bg-orange-50 rounded-xl border border-dashed border-orange-200"
        >
          <Truck className="h-12 w-12 text-orange-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No Active Deliveries</h2>
          <p className="text-gray-500 mt-2">All vehicles are currently idle or at rest stops.</p>
        </motion.div>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="border-orange-200 hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded">
                          IN TRANSIT
                        </span>
                        {booking.vehicle && (
                          <span className="text-sm font-medium text-gray-600">
                            {booking.vehicle.registrationNumber}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg">Booking #{booking.id}</h3>
                      {booking.cargo && (
                        <p className="text-sm text-gray-500">
                          {booking.cargo.type} • {booking.cargo.weight} {booking.cargo.unit}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-xs text-gray-500">Live</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-orange-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">ORIGIN</p>
                        <p className="text-sm font-medium">{booking.origin.address}</p>
                      </div>
                    </div>

                    {booking.currentLocation && (
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <MapPin className="h-4 w-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-gray-500 font-medium">CURRENT LOCATION</p>
                          <p className="text-sm font-medium">
                            {booking.currentLocation.lat.toFixed(4)}, {booking.currentLocation.lng.toFixed(4)}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Note: Real-time GPS updates via Socket.IO
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                        <Truck className="h-4 w-4 text-amber-600" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-500 font-medium">DESTINATION</p>
                        <p className="text-sm font-medium">{booking.destination.address}</p>
                      </div>
                    </div>
                  </div>

                  {booking.farmer && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Customer: {booking.farmer.name}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
