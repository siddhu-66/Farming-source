'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Factory, ArrowLeft, Recycle, Flame, RefreshCcw, Loader2, MapPin, DollarSign, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dialog } from '@/components/ui/Dialog';
import { useRouter } from 'next/navigation';
import DynamicMapComponent from '@/components/maps/DynamicMap';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const IndustryAnimations = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex flex-col items-center justify-center text-center space-y-2 border border-purple-200 dark:border-purple-800"
      >
        <motion.div
          animate={{ y: [0, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Factory className="h-8 w-8 text-purple-600" />
        </motion.div>
        <span className="font-medium text-sm text-purple-900 dark:text-purple-300">Factory Processing</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 flex flex-col items-center justify-center text-center space-y-2 border border-green-200 dark:border-green-800"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <Recycle className="h-8 w-8 text-green-600" />
        </motion.div>
        <span className="font-medium text-sm text-green-900 dark:text-green-300">Waste Recycling</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex flex-col items-center justify-center text-center space-y-2 border border-amber-200 dark:border-amber-800"
      >
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="h-8 w-8 text-amber-600" />
        </motion.div>
        <span className="font-medium text-sm text-amber-900 dark:text-amber-300">Biogas & Energy</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex flex-col items-center justify-center text-center space-y-2 border border-blue-200 dark:border-blue-800"
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
        >
          <RefreshCcw className="h-8 w-8 text-blue-600" />
        </motion.div>
        <span className="font-medium text-sm text-blue-900 dark:text-blue-300">Circular Economy</span>
      </motion.div>
    </div>
  );
};

export default function IndustryProcurementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedState, setSelectedState] = useState('');
  const [selectedMaterial, setSelectedMaterial] = useState('');

  // Offer modal state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [offerPrice, setOfferPrice] = useState<number | ''>('');
  const [offerQuantity, setOfferQuantity] = useState<number | ''>('');
  const [offerMessage, setOfferMessage] = useState('');
  const [submittingOffer, setSubmittingOffer] = useState(false);

  const fetchListings = async (query = '', state = '', material = '') => {
    try {
      const params = new URLSearchParams();
      if (query) params.append('search', query);
      if (state) params.append('state', state);
      if (material) params.append('wasteType', material);

      const queryString = params.toString();
      const endpoint = queryString ? `/industry/marketplace?${queryString}` : '/industry/marketplace';

      const response = await api.get(endpoint);
      if (response.data?.success) {
        setListings(response.data.data.listings || []);
      }
    } catch (error) {
      toast.error('Failed to load procurement listings');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchListings(searchQuery, selectedState, selectedMaterial);
  }, [selectedState, selectedMaterial]);

  const handleSearch = () => {
    setSearching(true);
    fetchListings(searchQuery, selectedState, selectedMaterial);
  };

  const handleOpenOfferModal = (listing: any) => {
    setSelectedListing(listing);
    setOfferPrice(listing.price || listing.pricePerUnit || 0);
    setOfferQuantity(listing.quantity || 0);
    setOfferMessage('Procurement bid for industrial processing');
    setIsOfferModalOpen(true);
  };

  const handleSubmitOffer = async () => {
    if (!selectedListing || !offerPrice || !offerQuantity) {
      toast.error('Please enter a valid price and quantity');
      return;
    }

    setSubmittingOffer(true);
    try {
      await api.post('/industry/offers', {
        listingId: selectedListing.id,
        offeredPrice: Number(offerPrice),
        quantity: Number(offerQuantity),
        message: offerMessage || 'Industrial procurement offer',
      });

      toast.success('Procurement offer submitted successfully!');
      setIsOfferModalOpen(false);
      fetchListings(searchQuery, selectedState, selectedMaterial);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit procurement offer');
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col lg:flex-row h-full gap-6"
    >
      {/* Sidebar Filters */}
      <div className="w-full lg:w-64 space-y-6 lg:border-r border-gray-200 dark:border-gray-800 lg:pr-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center text-purple-900 dark:text-purple-300">
            <Filter className="mr-2 h-4 w-4" /> Material Type
          </h3>
          <div className="space-y-2">
            {[
              { label: 'All Materials', value: '' },
              { label: 'Straw / Stubble', value: 'stubble' },
              { label: 'Husks / Shells', value: 'husk' },
              { label: 'Bagasse', value: 'bagasse' },
              { label: 'Organic Compost', value: 'compost' },
            ].map((mat) => (
              <label key={mat.value} className="flex items-center space-x-2 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="material"
                  checked={selectedMaterial === mat.value}
                  onChange={() => setSelectedMaterial(mat.value)}
                  className="rounded text-purple-600 focus:ring-purple-600"
                />
                <span>{mat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold mb-3 flex items-center text-purple-900 dark:text-purple-300">
            <MapPin className="mr-2 h-4 w-4" /> Region / State
          </h3>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full text-sm border rounded-lg p-2 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
          >
            <option value="">All States</option>
            <option value="Punjab">Punjab</option>
            <option value="Haryana">Haryana</option>
            <option value="Maharashtra">Maharashtra</option>
            <option value="Madhya Pradesh">Madhya Pradesh</option>
            <option value="Uttar Pradesh">Uttar Pradesh</option>
          </select>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center text-gray-900 dark:text-white">
            <Factory className="mr-3 text-purple-600" /> Biomass & Waste Procurement
          </h1>
        </div>

        <IndustryAnimations />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              className="pl-10 focus:ring-purple-600"
              placeholder="Search available agricultural waste & biomass..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700 text-white" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800">
          <DynamicMapComponent
            center={[20.5937, 78.9629]}
            zoom={4}
            className="w-full h-[260px] z-0"
            markers={[
              { position: [31.1471, 75.3412], role: 'industry', title: 'Wheat Stubble', subtitle: 'Punjab - 500 Tons' },
              { position: [19.7515, 75.7139], role: 'industry', title: 'Sugarcane Bagasse', subtitle: 'Maharashtra - 1200 Tons' },
              { position: [23.2599, 77.4126], role: 'industry', title: 'Soybean Husks', subtitle: 'Madhya Pradesh - 300 Tons' }
            ]}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-48 w-full rounded-2xl" />
            ))
          ) : listings.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 bg-gray-50 dark:bg-gray-900/20 rounded-xl border border-dashed border-gray-300 dark:border-gray-700">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">No procurement listings found</p>
              <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search terms.</p>
            </div>
          ) : (
            listings.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:border-purple-500/50 transition-all hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white">{item.title || item.cropName}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Listed by: {item.farmerId?.fullName || 'Verified Farmer'}</p>
                      </div>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800">
                        {item.cropName || 'Biomass'}
                      </Badge>
                    </div>
                    <div className="space-y-1.5 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Location: {item.address?.district ? `${item.address.district}, ` : ''}{item.address?.state || 'India'}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Package className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        <span>Available Quantity: <strong className="text-gray-900 dark:text-white">{item.quantity} {item.unit || 'Tons'}</strong></span>
                      </div>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <div>
                        <span className="text-xs text-gray-400 block">Listed Price</span>
                        <span className="text-2xl font-bold text-purple-600">₹{item.price || item.pricePerUnit || 0}</span>
                        <span className="text-xs text-gray-500">/{item.unit || 'Ton'}</span>
                      </div>
                      <Button
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        onClick={() => handleOpenOfferModal(item)}
                      >
                        Bid / Make Offer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Offer Modal */}
      {isOfferModalOpen && (
        <Dialog isOpen={isOfferModalOpen} onClose={() => setIsOfferModalOpen(false)} title="Submit Procurement Offer">
          <div className="space-y-4 py-4">
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">Listing</p>
              <p className="text-base text-purple-600 font-medium">{selectedListing?.title || selectedListing?.cropName}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Offer Price (₹/unit)</label>
                <Input
                  type="number"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Price per unit"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity ({selectedListing?.unit || 'Tons'})</label>
                <Input
                  type="number"
                  value={offerQuantity}
                  onChange={(e) => setOfferQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="Quantity"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes / Delivery Details</label>
              <Input
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                placeholder="e.g. Requires delivery within 7 business days"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t">
              <Button variant="outline" onClick={() => setIsOfferModalOpen(false)}>
                Cancel
              </Button>
              <Button
                className="bg-purple-600 hover:bg-purple-700 text-white"
                onClick={handleSubmitOffer}
                disabled={submittingOffer}
              >
                {submittingOffer ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Confirm Offer
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  );
}
