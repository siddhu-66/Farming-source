'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { MapPin, Truck, ArrowLeft, RefreshCw } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FarmerTransportPage() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);
  const router = useRouter();

  const fetchBookings = async () => {
    try {
      setFetching(true);
      const res = await api.get('/farmer/transport');
      if (res.data.success) {
        setBookings(res.data.data.bookings || []);
      }
    } catch (err) {
      toast.error('Failed to load transport bookings');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const payload = {
      orderId: 'mock-order-' + Math.floor(Math.random() * 1000), // mock order ID
      pickupAddress: {
        state: formData.get('pickupState') || 'Delhi',
        pincode: formData.get('pickupPincode') || '110001',
      },
      deliveryAddress: {
        state: formData.get('deliveryState') || 'Maharashtra',
        pincode: formData.get('deliveryPincode') || '400001',
      },
      pickupDate: formData.get('pickupDate'),
      cargo: formData.get('cargo'),
      weight: Number(formData.get('weight')),
      weightUnit: 'ton',
      specialInstructions: formData.get('instructions') as string,
    };

    try {
      const res = await api.post('/farmer/transport', payload);
      if (res.data.success) {
        toast.success('Transport requested successfully!');
        fetchBookings();
        (e.target as HTMLFormElement).reset();
      } else {
        toast.error('Failed to request transport');
      }
    } catch (err) {
      toast.error('Error requesting transport');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto relative overflow-hidden min-h-[70vh]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">Logistics & Transport</h1>
        </div>
        <Button variant="outline" onClick={fetchBookings} disabled={fetching}>
          <RefreshCw className={`w-4 h-4 mr-2 ${fetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>
      
      {/* Moving Truck Animation */}
      <div className="absolute top-20 w-full pointer-events-none opacity-20 z-0 overflow-hidden h-24">
        <motion.div
          initial={{ x: '-10%' }}
          animate={{ x: '110%' }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "linear",
          }}
          className="text-blue-500 absolute"
        >
          <Truck size={64} />
        </motion.div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center"><Truck className="mr-2" /> Request New Transport</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="flex items-center text-primary font-semibold mb-2"><MapPin className="mr-2 h-4 w-4" /> Pickup Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="State" name="pickupState" required placeholder="State" />
                    <Input label="Pincode" name="pickupPincode" required placeholder="Pincode" />
                  </div>
                  <Input label="Pickup Date" name="pickupDate" type="date" required />
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center text-accent font-semibold mb-2"><MapPin className="mr-2 h-4 w-4" /> Delivery Details</div>
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="State" name="deliveryState" required placeholder="State" />
                    <Input label="Pincode" name="deliveryPincode" required placeholder="Pincode" />
                  </div>
                </div>
                
                <hr className="border-gray-200 dark:border-gray-800" />
                
                <div className="grid grid-cols-1 gap-4">
                  <Input label="Cargo Type" name="cargo" required placeholder="e.g. Wheat Bags" />
                  <Input label="Total Weight (Tons)" name="weight" type="number" required placeholder="e.g. 5" />
                  <Input label="Special Instructions" name="instructions" placeholder="Any special needs?" />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Broadcasting...' : 'Broadcast Request to Transporters'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h2 className="text-xl font-bold">My Bookings</h2>
          {fetching ? (
            <p>Loading bookings...</p>
          ) : bookings.length === 0 ? (
            <Card>
               <CardContent className="p-6 text-center text-gray-500">
                 No active transport bookings.
               </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <Card key={booking.id}>
                  <CardContent className="p-4 flex flex-col justify-between">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">{booking.cargo} - {booking.weight} Tons</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                        {booking.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 flex justify-between">
                      <span>Pickup: {new Date(booking.pickupDate).toLocaleDateString()}</span>
                      <span>{booking.pickupAddress?.state || 'Origin'} ➔ {booking.deliveryAddress?.state || 'Destination'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
