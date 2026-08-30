'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Gavel, MapPin, Package, IndianRupee, Loader2, AlertCircle, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface AuctionListing {
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
  status: string;
  negotiable: boolean;
  minOrderQuantity: number;
  farmerId: {
    fullName: string;
    avatarUrl: string;
    verified: boolean;
  };
}

export default function AuctionsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<AuctionListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biddingFor, setBiddingFor] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidQuantity, setBidQuantity] = useState('');

  useEffect(() => {
    fetchAuctionListings();
  }, []);

  const fetchAuctionListings = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch listings that are either auction status or negotiable
      const res = await api.get('/marketplace', {
        params: {
          status: 'auction',
          sortBy: 'newest'
        }
      });
      if (res.data.success) {
        setListings(res.data.data.listings || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch auction listings');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (listingId: string) => {
    if (!bidAmount || !bidQuantity) {
      toast.error('Please enter bid amount and quantity');
      return;
    }

    const amount = parseFloat(bidAmount);
    const qty = parseFloat(bidQuantity);

    if (isNaN(amount) || isNaN(qty) || amount <= 0 || qty <= 0) {
      toast.error('Please enter valid bid values');
      return;
    }

    try {
      const res = await api.post('/marketplace/bids', {
        listingId,
        offerPrice: amount,
        quantity: qty
      });

      if (res.data.success) {
        toast.success('Bid placed successfully!');
        setBiddingFor(null);
        setBidAmount('');
        setBidQuantity('');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to place bid');
    }
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
          <h1 className="text-3xl font-bold">Auctions & Bidding</h1>
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
            <h1 className="text-3xl font-bold">Auctions & Bidding</h1>
            <p className="text-gray-500 text-sm mt-1">
              {listings.length} {listings.length === 1 ? 'listing' : 'listings'} available for bidding
            </p>
          </div>
        </div>
        <Gavel className="w-6 h-6 text-blue-600" />
      </div>

      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">How Bidding Works</h3>
              <p className="text-sm text-blue-700 mt-1">
                Place your best offer on negotiable listings. Farmers can accept, counter, or decline your bid.
                You'll be notified of any responses.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {listings.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200"
        >
          <Gavel className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-medium text-gray-500 mb-2">No auction listings available</h2>
          <p className="text-gray-400 mb-6">
            Check back later for new bidding opportunities
          </p>
          <Button onClick={() => router.push('/buyer/marketplace')} className="bg-blue-600 hover:bg-blue-700">
            Browse All Listings
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {listings.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-lg transition-shadow border-blue-200">
                <div className="flex flex-col md:flex-row">
                  <div className="relative h-48 md:h-auto md:w-48 bg-gray-200 shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <Image
                        src={listing.images[0]}
                        alt={listing.cropName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-200">
                        <Package className="w-16 h-16 text-blue-400" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-blue-600 text-white">
                      <Gavel className="w-3 h-3 mr-1" />
                      Auction
                    </Badge>
                    {listing.organicCertified && (
                      <Badge className="absolute top-3 right-3 bg-green-600 text-white">
                        Organic
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-4 flex-1">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 line-clamp-1">
                          {listing.cropName}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-1">{listing.title}</p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Starting Price</p>
                          <div className="flex items-center gap-1">
                            <IndianRupee className="w-4 h-4 text-blue-600" />
                            <span className="text-2xl font-bold text-blue-600">
                              {listing.price}
                            </span>
                            <span className="text-sm text-gray-500">/{listing.unit}</span>
                          </div>
                        </div>
                        {listing.qualityGrade && (
                          <Badge variant="default" className="border border-blue-200 bg-transparent text-blue-700">
                            {listing.qualityGrade}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Package className="w-4 h-4" />
                          <span>{listing.quantity} {listing.unit}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">
                            {listing.address?.district}, {listing.address?.state}
                          </span>
                        </div>
                      </div>

                      {listing.farmerId && (
                        <div className="flex items-center gap-2 pt-2 border-t">
                          {listing.farmerId.avatarUrl ? (
                            <Image
                              src={listing.farmerId.avatarUrl}
                              alt={listing.farmerId.fullName}
                              width={24}
                              height={24}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {listing.farmerId.fullName.charAt(0)}
                              </span>
                            </div>
                          )}
                          <span className="text-sm text-gray-700 font-medium">
                            {listing.farmerId.fullName}
                          </span>
                          {listing.farmerId.verified && (
                            <Badge className="text-xs bg-blue-100 text-blue-700">Verified</Badge>
                          )}
                        </div>
                      )}

                      {biddingFor === listing.id ? (
                        <div className="space-y-2 pt-2 border-t">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Your Bid (₹/{listing.unit})</label>
                              <Input
                                type="number"
                                placeholder="Amount"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                className="h-9"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-gray-600 mb-1 block">Quantity ({listing.unit})</label>
                              <Input
                                type="number"
                                placeholder="Qty"
                                value={bidQuantity}
                                onChange={(e) => setBidQuantity(e.target.value)}
                                className="h-9"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              onClick={() => handlePlaceBid(listing.id)}
                            >
                              Submit Bid
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBiddingFor(null);
                                setBidAmount('');
                                setBidQuantity('');
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2 pt-2">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                            onClick={() => setBiddingFor(listing.id)}
                          >
                            <Gavel className="w-4 h-4 mr-2" />
                            Place Bid
                          </Button>
                          <Button
                            variant="outline"
                            onClick={() => router.push(`/buyer/marketplace/${listing.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
