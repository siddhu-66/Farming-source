'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Factory, ArrowLeft, Recycle, Flame, RefreshCcw, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRouter } from 'next/navigation';
import DynamicMapComponent from '@/components/maps/DynamicMap';

import api from '@/lib/api';

const IndustryAnimations = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-purple-100 dark:bg-purple-900/20 flex flex-col items-center justify-center text-center space-y-2"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Factory className="h-8 w-8 text-purple-600" />
        </motion.div>
        <span className="font-medium text-sm">Factory Processing</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-green-100 dark:bg-green-900/20 flex flex-col items-center justify-center text-center space-y-2"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        >
          <Recycle className="h-8 w-8 text-green-600" />
        </motion.div>
        <span className="font-medium text-sm">Waste Recycling</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-orange-100 dark:bg-orange-900/20 flex flex-col items-center justify-center text-center space-y-2"
      >
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          <Flame className="h-8 w-8 text-orange-600" />
        </motion.div>
        <span className="font-medium text-sm">Biogas Production</span>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.05 }}
        className="p-4 rounded-xl bg-blue-100 dark:bg-blue-900/20 flex flex-col items-center justify-center text-center space-y-2"
      >
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
        >
          <RefreshCcw className="h-8 w-8 text-blue-600" />
        </motion.div>
        <span className="font-medium text-sm">Circular Economy</span>
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
  const [purchasingId, setPurchasingId] = useState<string | null>(null);

  const fetchListings = async (query = '') => {
    try {
      const endpoint = query ? `/api/industry/marketplace?search=${encodeURIComponent(query)}` : '/api/industry/marketplace';
      const response = await api.get(endpoint);
      if (response.data.success) {
        setListings(response.data.data.listings || []);
      }
    } catch (error) {
      import('react-hot-toast').then(({ toast }) => toast.error('Failed to load procurement listings'));
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleSearch = () => {
    setSearching(true);
    fetchListings(searchQuery);
  };

  const handlePurchase = async (id: string, price: number, quantity: number) => {
    setPurchasingId(id);
    try {
      // Create an offer to purchase the waste
      await api.post(`/api/industry/offers`, {
        listingId: id,
        offeredPrice: price,
        quantity: quantity,
        message: 'Direct purchase request'
      });
      const { toast } = await import('react-hot-toast');
      toast.success('Offer / Purchase request submitted successfully!');
      fetchListings(searchQuery);
    } catch (error) {
      const { toast } = await import('react-hot-toast');
      toast.error('Failed to process purchase');
    } finally {
      setPurchasingId(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="flex h-full gap-6"
    >
      {/* Sidebar Filters */}
      <div className="hidden lg:block w-64 space-y-6 border-r border-gray-200 dark:border-gray-800 pr-6">
        <div>
          <h3 className="font-semibold mb-3 flex items-center"><Filter className="mr-2 h-4 w-4" /> Material Type</h3>
          <div className="space-y-2">
            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-600" /> <span>Straw / Stubble</span></label>
            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-600" /> <span>Husks / Shells</span></label>
            <label className="flex items-center space-x-2"><input type="checkbox" className="rounded text-purple-600 focus:ring-purple-600" /> <span>Bagasse</span></label>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold flex items-center"><Factory className="mr-3 text-purple-600" /> Biomass & Waste Procurement</h1>
        </div>

        <IndustryAnimations />

        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              className="pl-10 focus:ring-purple-600" 
              placeholder="Search available agricultural waste..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button className="bg-purple-600 hover:bg-purple-700" onClick={handleSearch} disabled={searching}>
            {searching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
          </Button>
        </div>

        <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
          <DynamicMapComponent 
            center={[20.5937, 78.9629]} 
            zoom={4} 
            className="w-full h-[300px] z-0"
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
            <div className="col-span-full text-center py-12 text-gray-500">
              No procurement listings found.
            </div>
          ) : (
            listings.map((item, i) => (
              <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="hover:border-purple-500/50 transition-colors">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl">{item.title}</h3>
                      <Badge className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">{item.cropName}</Badge>
                    </div>
                    <div className="space-y-2 mt-4 text-sm text-gray-600 dark:text-gray-400">
                      <p>Location: {item.address?.state || 'Unknown'} - {item.address?.district || ''}</p>
                      <p>Available Quantity: <span className="font-semibold text-gray-900 dark:text-white">{item.quantity} {item.unit}</span></p>
                    </div>
                    <div className="mt-6 flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4">
                      <span className="text-2xl font-bold text-purple-600">₹{item.pricePerUnit}/{item.unit}</span>
                      <Button 
                        className="bg-purple-600 hover:bg-purple-700"
                        onClick={() => handlePurchase(item.id, item.pricePerUnit, item.quantity)}
                        disabled={purchasingId === item.id}
                      >
                        {purchasingId === item.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Bid / Purchase'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
