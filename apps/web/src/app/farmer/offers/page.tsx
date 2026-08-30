'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ArrowLeft, RefreshCw, Handshake } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function FarmerOffersPage() {
  const [loading, setLoading] = useState(true);
  const [offers, setOffers] = useState<any[]>([]);
  const router = useRouter();

  const fetchOffers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/farmer/offers');
      if (response.data.success) {
        setOffers(response.data.data.offers || []);
      } else {
        toast.error('Failed to load offers');
      }
    } catch (error) {
      console.error('Failed to fetch offers', error);
      toast.error('Error loading offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  const handleAction = async (id: string, action: 'accept' | 'reject' | 'counter') => {
    try {
      const payload = action === 'counter' ? { counterPrice: 100, counterMessage: 'Mock counter message' } : undefined;
      const res = await api.patch(`/farmer/offers/${id}/${action}`, payload);
      
      if (res.data.success) {
        toast.success(`Offer ${action}ed successfully`);
        fetchOffers();
      } else {
        toast.error(`Failed to ${action} offer`);
      }
    } catch (err) {
      toast.error(`Error trying to ${action} offer`);
    }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold flex items-center">
            <Handshake className="mr-3 text-primary" /> Received Offers
          </h1>
        </div>
        <Button variant="outline" onClick={fetchOffers} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {loading ? (
           Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)
        ) : offers.length === 0 ? (
           <p className="text-gray-500 py-8 text-center">No active offers at the moment.</p>
        ) : (
          offers.map((offer) => (
            <motion.div 
              key={offer.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.01 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardContent className="p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h3 className="font-semibold text-lg">{offer.listingId?.title || offer.listingId?.cropName || 'Crop Listing'}</h3>
                    <p className="text-sm text-gray-500">
                      Buyer: {offer.buyerId?.name || offer.industryId?.name || 'Unknown'} • Date: {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                    <span className={`inline-flex items-center mt-2 rounded-full px-2.5 py-0.5 text-xs font-semibold ${offer.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : offer.status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {offer.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 mb-1">Offered Price</p>
                    <p className="text-2xl font-bold text-primary">₹{offer.offeredPrice}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                    {offer.status === 'pending' ? (
                      <>
                        <Button variant="danger" className="w-full md:w-auto" onClick={() => handleAction(offer.id, 'reject')}>Reject</Button>
                        <Button variant="outline" className="w-full md:w-auto" onClick={() => handleAction(offer.id, 'counter')}>Counter</Button>
                        <Button variant="primary" className="w-full md:w-auto" onClick={() => handleAction(offer.id, 'accept')}>Accept</Button>
                      </>
                    ) : (
                      <Button variant="outline" disabled className="w-full md:w-auto">Action Taken</Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
