'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Box, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function TransportBookingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);
  const [activeBookings, setActiveBookings] = useState<any[]>([]);
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const [availableRes, activeRes, vehiclesRes] = await Promise.all([
        api.get('/api/transport/bookings?status=available'),
        api.get('/api/transport/bookings'),
        api.get('/api/transport/vehicles')
      ]);
      setRequests(availableRes.data.data?.bookings || []);
      
      const allActive = activeRes.data.data?.bookings || [];
      setActiveBookings(allActive.filter((b: any) => ['accepted', 'picked_up', 'in_transit'].includes(b.status)));
      setVehicles(vehiclesRes.data.data?.vehicles || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleAccept = async (id: string, proposedFare?: number) => {
    const availableVehicle = vehicles.find(v => v.status === 'available');
    if (!availableVehicle) {
      toast.error('No available vehicles to assign. Please register or free up a vehicle.');
      return;
    }

    try {
      setAcceptingId(id);
      await api.patch(`/api/transport/bookings/${id}/accept`, {
        vehicleId: availableVehicle.id,
        fare: proposedFare || 5000
      });
      toast.success('Booking accepted successfully');
      fetchBookings();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to accept booking');
    } finally {
      setAcceptingId(null);
    }
  };

  const renderBookingCard = (req: any, isAvailable: boolean, i: number) => {
    // Extract location info gracefully based on possible schema
    const pickup = req.pickupAddress?.district || req.pickupAddress?.village || req.pickup || 'Pickup Location';
    const drop = req.deliveryAddress?.district || req.deliveryAddress?.village || req.drop || 'Drop Location';
    const load = req.cargoDetails || req.load || 'Cargo Load';
    const price = req.fare || req.price || '₹ --';

    return (
      <motion.div
        key={req.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: i * 0.1 }}
      >
        <Card className={isAvailable ? '' : 'border-l-4 border-l-blue-500'}>
          <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="space-y-3 flex-1 w-full">
              <div className="flex items-center justify-between">
                <span className="font-mono text-sm text-gray-500">#{req.id?.slice(0, 8)}</span>
                <Badge variant={isAvailable ? 'success' : 'default'}>
                  {isAvailable ? 'New Request' : req.status?.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <MapPin className="h-4 w-4 mr-2 text-gray-400 shrink-0" />
                <span className="font-semibold truncate">{pickup}</span>
                <span className="mx-3 text-gray-400">→</span>
                <span className="font-semibold truncate">{drop}</span>
              </div>
              
              <div className="flex items-center text-sm text-gray-500">
                <Box className="h-4 w-4 mr-2" /> {load}
              </div>
            </div>
            
            <div className="text-right md:ml-8 border-t md:border-t-0 md:border-l border-gray-200 dark:border-gray-800 pt-4 md:pt-0 md:pl-8 w-full md:w-auto">
              <p className="text-sm text-gray-500 mb-1">{isAvailable ? 'Offered Fare' : 'Agreed Fare'}</p>
              <p className="text-2xl font-bold text-primary mb-4">{typeof price === 'number' ? `₹${price}` : price}</p>
              
              {isAvailable ? (
                <Button 
                  className="w-full md:w-auto min-w-[140px]" 
                  onClick={() => handleAccept(req.id, req.fare)}
                  disabled={acceptingId === req.id}
                >
                  {acceptingId === req.id ? 'Accepting...' : 'Accept Booking'}
                </Button>
              ) : (
                <div className="text-sm bg-gray-100 dark:bg-gray-800 rounded px-3 py-2 text-center">
                  Assigned to: {req.vehicle?.registrationNumber || 'Vehicle'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  const requestCards = loading ? (
    <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  ) : requests.length === 0 ? (
    <div className="text-center py-12 text-gray-500">No new booking requests available.</div>
  ) : (
    <div className="space-y-4">
      {requests.map((req, i) => renderBookingCard(req, true, i))}
    </div>
  );

  const activeCards = loading ? (
    <div className="space-y-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
  ) : activeBookings.length === 0 ? (
    <div className="text-center py-12 text-gray-500">No active bookings right now.</div>
  ) : (
    <div className="space-y-4">
      {activeBookings.map((req, i) => renderBookingCard(req, false, i))}
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Button variant="ghost" onClick={() => router.back()} className="p-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-3xl font-bold">Booking Requests</h1>
      </div>
      <Tabs defaultValue="available" className="w-full">
        <TabsList className="w-full flex">
          <TabsTrigger value="available" className="flex-1">Available Requests</TabsTrigger>
          <TabsTrigger value="active" className="flex-1">My Active Bookings</TabsTrigger>
        </TabsList>
        <TabsContent value="available">{requestCards}</TabsContent>
        <TabsContent value="active">{activeCards}</TabsContent>
      </Tabs>
    </motion.div>
  );
}
