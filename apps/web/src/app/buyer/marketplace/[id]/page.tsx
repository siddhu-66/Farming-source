'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Star, ShieldCheck, Heart, Share2, MessageCircle, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { BidDialog } from '@/components/buyer/marketplace/BidDialog';
import { ReportDialog } from '@/components/buyer/marketplace/ReportDialog';
import { ImageGallery } from '@/components/buyer/marketplace/ImageGallery';
import { TransportEstimate } from '@/components/buyer/marketplace/TransportEstimate';
import { MarketPriceCard } from '@/components/buyer/marketplace/MarketPriceCard';
import { ReviewsSection } from '@/components/buyer/marketplace/ReviewsSection';
import { ListingCard } from '@/components/buyer/marketplace/ListingCard';
import toast from 'react-hot-toast';
import api from '@/lib/api';

export default function ListingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState<any>(null);
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [isSaved, setIsSaved] = useState(false);
  
  // Dialogs
  const [bidOpen, setBidOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await api.get(`/api/marketplace/${id}`);
        setListing(response.data.data.listing);
        
        // Fetch similar listings
        const similarRes = await api.get(`/api/marketplace/similar/${id}`);
        setSimilarListings(similarRes.data.data.similar || []);
      } catch (error) {
        toast.error('Failed to load listing details');
        router.back();
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id, router]);

  const handleSaveToggle = async () => {
    try {
      if (isSaved) {
        await api.delete(`/api/marketplace/save/${id}`);
        setIsSaved(false);
        toast.success('Listing removed from saved');
      } else {
        await api.post('/api/marketplace/save', { listingId: id });
        setIsSaved(true);
        toast.success('Listing saved');
      }
    } catch {
      toast.error('Failed to update saved listings');
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `AgriAssist Marketplace: ${listing?.cropName}`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const handleBuyNow = async () => {
    toast.success('Redirecting to checkout flow...');
    setTimeout(() => router.push('/buyer/orders'), 1000);
  };

  if (loading) {
    return (
      <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto w-full p-4">
        <Skeleton className="h-10 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7">
            <Skeleton className="h-[400px] rounded-3xl w-full" />
          </div>
          <div className="lg:col-span-5 space-y-6">
            <Skeleton className="h-12 w-3/4" />
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  return (
    <div className="flex flex-col h-full gap-6 max-w-6xl mx-auto w-full pb-24 md:pb-8 relative">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <Button variant="ghost" className="self-start mb-2 px-0 hover:bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
          </Button>
          <p className="text-xs text-gray-500 font-mono">ID: AGR-{new Date(listing.createdAt).getFullYear()}-{listing.id.substring(0, 6).toUpperCase()}</p>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button variant="ghost" size="icon" onClick={handleShare}>
            <Share2 className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleSaveToggle}>
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setReportOpen(true)}>
            <AlertTriangle className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Image Gallery, Info & Reviews */}
        <div className="lg:col-span-7 space-y-6">
          <ImageGallery 
            images={listing.images || []} 
            organicCertified={listing.organicCertified} 
            qualityGrade={listing.qualityGrade} 
          />
          
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <h3 className="text-xl font-bold mb-4">Description</h3>
            <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap leading-relaxed">
              {listing.description || 'No description provided by the farmer.'}
            </p>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-800">
              <div>
                <p className="text-sm text-gray-500 mb-1">Category</p>
                <p className="font-semibold">{listing.category}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Variety</p>
                <p className="font-semibold">{listing.variety || 'Standard'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Harvest Date</p>
                <p className="font-semibold">{listing.harvestDate ? new Date(listing.harvestDate).toLocaleDateString() : 'N/A'}</p>
              </div>
            </div>
          </div>

          <MarketPriceCard listingPrice={listing.price} unit={listing.unit} />
          
          <ReviewsSection listingId={id} />
        </div>

        {/* Right Column: Key Details, Price & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
            <div className="mb-6">
              <h1 className="text-3xl font-bold tracking-tight mb-2">{listing.cropName}</h1>
              <div className="flex flex-wrap items-center text-gray-500 gap-2 text-sm">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1" /> {listing.address?.district}, {listing.address?.state}</span>
                <span>•</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${listing.status === 'active' || listing.status === 'auction' ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-gray-100 text-gray-700'}`}>
                  {listing.status === 'auction' ? 'Auction Active' : listing.status === 'active' ? 'Available' : listing.status}
                </span>
              </div>
            </div>

            <div className="p-5 bg-primary/5 dark:bg-primary/10 rounded-2xl mb-6">
              <div className="flex justify-between items-end mb-3">
                <div>
                  <p className="text-sm text-primary font-semibold mb-1">Expected Price</p>
                  <p className="text-4xl font-bold text-gray-900 dark:text-white">₹{listing.price}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 mb-1">per {listing.unit}</p>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{listing.quantity} {listing.unit} Available</p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-primary/10 text-sm">
                <span className="text-gray-500">Minimum Price: <span className="font-medium text-gray-900 dark:text-white">₹{listing.price * 0.9}</span></span>
                <span className="text-gray-500">Negotiable: <span className="font-medium text-gray-900 dark:text-white">{listing.negotiable ? 'Yes' : 'No'}</span></span>
              </div>
            </div>

            {/* Expanded AI Quality Report */}
            {listing.aiScore && (
              <div className="p-5 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl mb-6 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    <h4 className="font-bold text-blue-900 dark:text-blue-100 text-lg">AI Quality Report</h4>
                  </div>
                  <Badge className="bg-blue-600 hover:bg-blue-700">{Math.round(listing.aiScore)}% Confidence</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                  <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                    <p className="text-blue-800/70 dark:text-blue-200/70 mb-0.5">Overall Quality</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">{listing.qualityGrade || 'Excellent'}</p>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                    <p className="text-blue-800/70 dark:text-blue-200/70 mb-0.5">Freshness</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">High</p>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                    <p className="text-blue-800/70 dark:text-blue-200/70 mb-0.5">Disease</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">None Detected</p>
                  </div>
                  <div className="bg-white/60 dark:bg-black/20 p-2.5 rounded-lg">
                    <p className="text-blue-800/70 dark:text-blue-200/70 mb-0.5">Moisture Est.</p>
                    <p className="font-semibold text-blue-900 dark:text-blue-100">{listing.moisture || '12'}%</p>
                  </div>
                </div>

                <div className="bg-blue-100/50 dark:bg-blue-950/50 p-3 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1 flex items-center gap-1">✨ AI Suggestion</p>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    High quality crop. Expected market demand is increasing in your district. Suggested to buy within 3 days before price inflates.
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-3 hidden md:block">
              {listing.status === 'auction' ? (
                <Button size="lg" className="w-full text-lg h-14" onClick={() => setBidOpen(true)}>
                  Place Bid
                </Button>
              ) : (
                <Button size="lg" className="w-full text-lg h-14 bg-green-600 hover:bg-green-700 text-white" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              )}
              
              <Button variant="outline" size="lg" className="w-full text-lg h-14" onClick={() => toast.success('Starting chat with farmer...')}>
                <MessageCircle className="w-5 h-5 mr-2" /> Chat with Farmer
              </Button>
            </div>
          </div>

          <TransportEstimate quantity={listing.quantity} />

          {/* Farmer Profile Snippet */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm flex items-center justify-between group cursor-pointer hover:border-primary/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {listing.farmerId?.name?.charAt(0) || 'F'}
              </div>
              <div>
                <h3 className="font-bold text-lg flex items-center gap-1.5">
                  {listing.farmerId?.name || 'Unknown Farmer'}
                  {listing.farmerId?.isVerified && <ShieldCheck className="w-4 h-4 text-blue-500" />}
                </h3>
                <div className="flex items-center text-sm text-gray-500 gap-3 mt-1">
                  <span className="flex items-center text-amber-500 font-medium">
                    <Star className="w-4 h-4 fill-current mr-1" /> {listing.farmerId?.rating || 4.5}
                  </span>
                  <span>125 Sales</span>
                </div>
                <p className="text-xs text-gray-400 mt-1">Member since {listing.farmerId?.createdAt ? new Date(listing.farmerId.createdAt).getFullYear() : '2023'}</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary transition-colors" />
          </div>

        </div>
      </div>

      {/* Similar Listings Section */}
      {similarListings.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-2xl font-bold mb-6">More {listing.category} Nearby</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {similarListings.map(similar => (
              <ListingCard key={similar.id} listing={similar} />
            ))}
          </div>
        </div>
      )}

      {/* Mobile Sticky Action Bar */}
      <div className="md:hidden fixed bottom-[72px] left-0 right-0 p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-t border-gray-100 dark:border-gray-800 flex gap-3 z-40">
        <Button variant="outline" size="lg" className="flex-1" onClick={() => toast.success('Starting chat with farmer...')}>
          <MessageCircle className="w-5 h-5" />
        </Button>
        {listing.status === 'auction' ? (
          <Button size="lg" className="flex-[3] text-base" onClick={() => setBidOpen(true)}>
            Place Bid
          </Button>
        ) : (
          <Button size="lg" className="flex-[3] text-base bg-green-600 hover:bg-green-700 text-white" onClick={handleBuyNow}>
            Buy Now
          </Button>
        )}
      </div>

      <BidDialog 
        isOpen={bidOpen} 
        onClose={() => setBidOpen(false)}
        listingId={id}
        cropName={listing.cropName}
        currentPrice={listing.price}
        availableQuantity={listing.quantity}
        unit={listing.unit}
      />
      
      <ReportDialog 
        isOpen={reportOpen} 
        onClose={() => setReportOpen(false)}
        listingId={id}
      />
    </div>
  );
}
