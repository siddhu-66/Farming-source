'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Trash2, MapPin, Package, IndianRupee, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface SavedListing {
  id: string;
  listingId: string;
  userId: string;
  createdAt: string;
  listing: {
    id: string;
    cropName: string;
    title: string;
    price: number;
    unit: string;
    quantity: number;
    images: string[];
    address: {
      district: string;
      state: string;
    };
    organicCertified: boolean;
    qualityGrade: string;
    farmerId: {
      fullName: string;
      avatarUrl: string;
      verified: boolean;
    };
  };
}

export default function SavedPage() {
  const router = useRouter();
  const [savedListings, setSavedListings] = useState<SavedListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSavedListings();
  }, []);

  const fetchSavedListings = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/marketplace/saved');
      if (res.data.success) {
        setSavedListings(res.data.data.savedListings || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch saved listings');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (listingId: string) => {
    try {
      const res = await api.delete(`/marketplace/save/${listingId}`);
      if (res.data.success) {
        toast.success('Removed from saved');
        setSavedListings(prev => prev.filter(item => item.listing.id !== listingId));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to remove');
    }
  };

  const handleViewListing = (listingId: string) => {
    router.push(`/buyer/marketplace/${listingId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
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
          <h1 className="text-3xl font-bold">Saved Listings</h1>
        </div>
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </CardContent>
        </Card>
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
            <h1 className="text-3xl font-bold">Saved Listings</h1>
            <p className="text-gray-500 text-sm mt-1">
              {savedListings.length} {savedListings.length === 1 ? 'listing' : 'listings'} saved
            </p>
          </div>
        </div>
        <Heart className="w-6 h-6 text-blue-600 fill-blue-600" />
      </div>

      {savedListings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200"
        >
          <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-500 mb-2">No saved listings yet</h2>
          <p className="text-gray-400 mb-6">
            Browse the marketplace and save listings you're interested in
          </p>
          <Button onClick={() => router.push('/buyer/marketplace')} className="bg-blue-600 hover:bg-blue-700">
            Browse Marketplace
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {savedListings.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-blue-100">
                <div className="relative h-48 bg-gray-200">
                  {item.listing.images && item.listing.images.length > 0 ? (
                    <Image
                      src={item.listing.images[0]}
                      alt={item.listing.cropName}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                      <Package className="w-16 h-16 text-blue-400" />
                    </div>
                  )}
                  {item.listing.organicCertified && (
                    <Badge className="absolute top-3 left-3 bg-green-600 text-white">
                      Organic
                    </Badge>
                  )}
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-3 right-3 bg-white/90 hover:bg-red-50 text-red-600 rounded-full"
                    onClick={() => handleRemove(item.listing.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 line-clamp-1">
                        {item.listing.cropName}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-1">{item.listing.title}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <IndianRupee className="w-4 h-4 text-blue-600" />
                        <span className="text-2xl font-bold text-blue-600">
                          {item.listing.price}
                        </span>
                        <span className="text-sm text-gray-500">/{item.listing.unit}</span>
                      </div>
                      {item.listing.qualityGrade && (
                        <Badge variant="default" className="border border-blue-200 bg-transparent text-blue-700">
                          {item.listing.qualityGrade}
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Package className="w-4 h-4" />
                      <span>
                        {item.listing.quantity} {item.listing.unit} available
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="line-clamp-1">
                        {item.listing.address?.district}, {item.listing.address?.state}
                      </span>
                    </div>

                    {item.listing.farmerId && (
                      <div className="flex items-center gap-2 pt-2 border-t">
                        {item.listing.farmerId.avatarUrl ? (
                          <Image
                            src={item.listing.farmerId.avatarUrl}
                            alt={item.listing.farmerId.fullName}
                            width={24}
                            height={24}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {item.listing.farmerId.fullName.charAt(0)}
                            </span>
                          </div>
                        )}
                        <span className="text-sm text-gray-700 font-medium">
                          {item.listing.farmerId.fullName}
                        </span>
                        {item.listing.farmerId.verified && (
                          <Badge className="text-xs bg-blue-100 text-blue-700">Verified</Badge>
                        )}
                      </div>
                    )}

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={() => handleViewListing(item.listing.id)}
                    >
                      View Details
                    </Button>
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
