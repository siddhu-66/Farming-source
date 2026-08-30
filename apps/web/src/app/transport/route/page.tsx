'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Navigation, Clock, Package, Loader2, TrendingUp } from 'lucide-react';
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
  estimatedDelivery?: string;
  distance?: string;
  duration?: string;
  cargo?: { type: string; weight: number; unit: string };
  vehicle?: { registrationNumber: string; type: string };
  farmer?: { name: string; phone: string };
  createdAt: string;
}

export default function RoutePage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await api.get('/transport/bookings');
        if (response.data.success) {
          setBookings(response.data.data.bookings || []);
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Failed to fetch bookings');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'requested':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'accepted':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'picked_up':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'in_transit':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold">Routes</h1>
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
          <h1 className="text-3xl font-bold">Routes</h1>
        </div>
        <div className="text-sm text-gray-500">
          {bookings.length} route{bookings.length !== 1 ? 's' : ''}
        </div>
      </div>

      {bookings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 text-center bg-orange-50 rounded-xl border border-dashed border-orange-200"
        >
          <Navigation className="h-12 w-12 text-orange-300 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-gray-700">No Routes Found</h2>
          <p className="text-gray-500 mt-2">Active bookings will appear here with route information.</p>
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
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded border ${getStatusColor(booking.status)}`}>
                          {formatStatus(booking.status)}
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
                    <div className="text-right text-sm text-gray-500">
                      <p>{formatDate(booking.createdAt)}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gradient-to-b from-orange-300 via-amber-300 to-green-300" />

                      <div className="relative">
                        <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-orange-500 border-2 border-white shadow-sm z-10" />
                        <div className="flex items-start gap-2">
                          <MapPin className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">ORIGIN</p>
                            <p className="text-sm font-medium">{booking.origin.address}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {booking.origin.lat.toFixed(4)}, {booking.origin.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {(booking.distance || booking.duration) && (
                        <div className="relative flex items-center gap-4 text-xs text-gray-500 pl-5">
                          <TrendingUp className="h-3 w-3" />
                          {booking.distance && <span>{booking.distance}</span>}
                          {booking.duration && (
                            <>
                              <span>•</span>
                              <span>{booking.duration}</span>
                            </>
                          )}
                        </div>
                      )}

                      <div className="relative">
                        <div className="absolute -left-[27px] w-4 h-4 rounded-full bg-green-500 border-2 border-white shadow-sm z-10" />
                        <div className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-xs text-gray-500 font-medium">DESTINATION</p>
                            <p className="text-sm font-medium">{booking.destination.address}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {booking.destination.lat.toFixed(4)}, {booking.destination.lng.toFixed(4)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {booking.estimatedDelivery && (
                      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 text-sm text-gray-600">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Estimated Arrival: {new Date(booking.estimatedDelivery).toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    {booking.farmer && (
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Customer: {booking.farmer.name} • {booking.farmer.phone}
                        </p>
                      </div>
                    )}
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
