'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { Listing } from '@/types';
import { FarmerListingCard } from '@/components/farmer/crops/FarmerListingCard';
import { ListingsAnalytics } from '@/components/farmer/crops/ListingsAnalytics';

const TABS = ['All', 'Draft', 'Active', 'Auction', 'Reserved', 'Sold', 'Expired', 'Paused', 'Deleted'];

export default function MyListingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [analytics, setAnalytics] = useState(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  const fetchAnalytics = async () => {
    try {
      setAnalyticsLoading(true);
      const res = await api.get('/api/farmer/listings/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params: any = {
        limit: 50,
      };
      if (activeTab !== 'All') params.status = activeTab.toLowerCase();
      if (searchQuery) params.search = searchQuery;

      const res = await api.get('/api/farmer/listings', { params });
      if (res.data.success) {
        setListings(res.data.data.listings || []);
      }
    } catch (err) {
      toast.error('Failed to load listings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchListings();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [activeTab, searchQuery]);

  const handlePause = async (id: string) => {
    try {
      await api.patch(`/api/farmer/listings/${id}/pause`);
      toast.success('Listing paused');
      setListings(listings.map(l => l.id === id ? { ...l, status: 'paused' } : l));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to pause');
    }
  };

  const handleResume = async (id: string) => {
    try {
      await api.patch(`/api/farmer/listings/${id}/resume`);
      toast.success('Listing resumed');
      setListings(listings.map(l => l.id === id ? { ...l, status: 'active' } : l));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to resume');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/api/farmer/listings/${id}`);
      toast.success('Listing deleted');
      setListings(listings.map(l => l.id === id ? { ...l, status: 'deleted' } : l));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleRepublish = async (id: string) => {
    try {
      const res = await api.post(`/api/farmer/listings/${id}/republish`);
      if (res.data.success) {
        toast.success('Listing republished');
        setListings([res.data.data.listing, ...listings]);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to republish');
    }
  };

  const handleViewAnalytics = (id: string) => {
    toast('Detailed analytics modal coming soon!');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.back()} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <h1 className="text-3xl font-bold">My Listings</h1>
        </div>
        <Button onClick={() => router.push('/farmer/marketplace/new')}>
          <Plus className="mr-2 h-4 w-4" /> New Listing
        </Button>
      </div>

      {/* Analytics Summary */}
      <ListingsAnalytics data={analytics} loading={analyticsLoading} />

      {/* Search & Tabs */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input 
            placeholder="Search by ID or Crop Name..." 
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex overflow-x-auto pb-2 gap-2 hide-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                activeTab === tab 
                  ? 'bg-primary text-white shadow-sm' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                <Skeleton className="w-full h-48 rounded-lg" />
                <Skeleton className="w-3/4 h-6" />
                <Skeleton className="w-1/2 h-4" />
                <Skeleton className="w-full h-10" />
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-gray-900 rounded-xl border">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 dark:text-white">No listings found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or search query.</p>
            {activeTab !== 'All' && (
              <Button variant="outline" className="mt-6" onClick={() => setActiveTab('All')}>
                View All Listings
              </Button>
            )}
          </div>
        ) : (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            {listings.map(listing => (
              <FarmerListingCard
                key={listing.id}
                listing={listing}
                onPause={handlePause}
                onResume={handleResume}
                onDelete={handleDelete}
                onRepublish={handleRepublish}
                onViewAnalytics={handleViewAnalytics}
              />
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
