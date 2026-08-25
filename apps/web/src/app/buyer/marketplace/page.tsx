'use client';
import { useEffect, useState, useCallback, useRef } from 'react';
import { Search, Filter, MapPin, ChevronDown, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ListingCard } from '@/components/buyer/marketplace/ListingCard';
import { CategoryChips } from '@/components/buyer/marketplace/CategoryChips';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function MarketplacePage() {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  
  // Filters state
  const [category, setCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [organic, setOrganic] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 1000]);
  
  // Infinite Scroll state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef(null);

  const fetchListings = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      
      const queryParams = new URLSearchParams({
        page: pageNum.toString(),
        limit: '12',
        sortBy,
        ...(category && { category }),
        ...(searchQuery && { search: searchQuery }),
        ...(organic && { organic: 'true' }),
        ...(priceRange[1] < 1000 && { maxPrice: priceRange[1].toString() }),
      });

      const response = await api.get(`/api/marketplace?${queryParams.toString()}`);
      const data = response.data.data.listings || [];
      
      if (append) {
        setListings(prev => [...prev, ...data]);
      } else {
        setListings(data);
      }
      
      setHasMore(data.length === 12);
      
      // Fetch recommendations on first load
      if (pageNum === 1 && !append) {
        // Mock AI recommendations for now by shuffling a few items
        setRecommendations(data.slice(0, 3).sort(() => Math.random() - 0.5));
      }
    } catch (error) {
      toast.error('Failed to load marketplace');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset page and fetch when filters change
    setPage(1);
    const timeout = setTimeout(() => {
      fetchListings(1, false);
    }, 500); // Debounce search
    return () => clearTimeout(timeout);
  }, [category, searchQuery, sortBy, organic, priceRange]);

  // Infinite Scroll logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 1.0 }
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, loading]);

  useEffect(() => {
    if (page > 1) fetchListings(page, true);
  }, [page]);

  const handleSave = async (id: string) => {
    try {
      await api.post('/api/marketplace/save', { listingId: id });
      toast.success('Listing saved');
    } catch {
      toast.error('Failed to save listing');
    }
  };

  return (
    <div className="flex flex-col h-full gap-6 max-w-7xl mx-auto w-full">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Marketplace</h1>
          <p className="text-gray-500">Discover fresh crops directly from farmers.</p>
        </div>
        
        <div className="flex-1 w-full md:max-w-md relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
          <Input 
            className="pl-10 h-12 rounded-full border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm text-base" 
            placeholder="Search crops, grades, or farmers..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <CategoryChips selected={category} onSelect={setCategory} />

      <div className="flex h-full gap-8">
        {/* Sidebar Filters */}
        <div className="hidden lg:flex w-64 flex-col gap-6 sticky top-6 self-start">
          <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" /> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Sort By</label>
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full appearance-none bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="relevance">Best Match (AI)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              <div>
                <label className="text-sm font-medium mb-2 block text-gray-700">Max Price (₹{priceRange[1]})</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1000" 
                  step="10"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                  className="w-full accent-primary" 
                />
              </div>

              <hr className="border-gray-100 dark:border-gray-800" />

              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center">
                    <input 
                      type="checkbox" 
                      checked={organic}
                      onChange={(e) => setOrganic(e.target.checked)}
                      className="peer sr-only" 
                    />
                    <div className="w-5 h-5 border-2 border-gray-300 dark:border-gray-600 rounded transition-colors peer-checked:bg-green-500 peer-checked:border-green-500" />
                    <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">Organic Only</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 space-y-8 pb-10">
          
          {/* AI Recommendations */}
          {!searchQuery && !category && recommendations.length > 0 && (
            <section className="space-y-4 bg-primary/5 dark:bg-primary/10 -mx-4 px-4 sm:mx-0 sm:px-6 py-6 rounded-3xl">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-primary">
                <Sparkles className="w-5 h-5" /> Recommended for You
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
                {recommendations.map(listing => (
                  <ListingCard key={`rec-${listing.id}`} listing={listing} onSave={handleSave} />
                ))}
              </div>
            </section>
          )}

          {/* Feed */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold flex items-center justify-between">
              {searchQuery ? `Search Results for "${searchQuery}"` : category ? `${category} Listings` : 'Latest Listings'}
              <span className="text-sm font-normal text-gray-500">{listings.length} results</span>
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
              {loading && page === 1 ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-96 w-full rounded-2xl" />
                ))
              ) : (
                listings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onSave={handleSave} />
                ))
              )}
            </div>
            
            {/* Infinite Scroll Target */}
            <div ref={observerTarget} className="h-10 w-full flex items-center justify-center mt-6">
              {loading && page > 1 && (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              )}
              {!hasMore && listings.length > 0 && (
                <p className="text-sm text-gray-500">You've reached the end of the marketplace.</p>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
