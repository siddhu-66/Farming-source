import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Edit2, Play, Pause, Trash2, BarChart2, Share2, Copy } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useState } from 'react';
import { Listing } from '@/types';
import toast from 'react-hot-toast';

interface FarmerListingCardProps {
  listing: Listing & { savedCount?: number; bidsCount?: number; ordersCount?: number };
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onRepublish: (id: string) => void;
  onViewAnalytics: (id: string) => void;
}

export function FarmerListingCard({
  listing,
  onPause,
  onResume,
  onDelete,
  onRepublish,
  onViewAnalytics
}: FarmerListingCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'sold': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'reserved': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/buyer/marketplace/${listing.id}`);
    toast.success('Link copied to clipboard');
    setMenuOpen(false);
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white dark:bg-gray-900 border">
      <div className="relative h-48 w-full bg-gray-100">
        {listing.images && listing.images.length > 0 ? (
          <img src={listing.images[0]} alt={listing.cropName} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No Image
          </div>
        )}
        <div className="absolute top-2 left-2 flex flex-col gap-2">
          <Badge className={getStatusColor(listing.status)}>{listing.status.toUpperCase()}</Badge>
          {listing.organicCertified && <Badge className="bg-green-600 text-white border-none">Organic</Badge>}
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-2 right-2 z-10 relative">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 bg-white/80 backdrop-blur rounded-full shadow-sm hover:bg-white"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <MoreVertical className="w-4 h-4 text-gray-700" />
          </Button>
          
          <AnimatePresence>
            {menuOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="fixed inset-0 z-40"
                  onClick={() => setMenuOpen(false)}
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-10 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-50 flex flex-col"
                >
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none" onClick={() => { toast('Edit coming soon'); setMenuOpen(false); }}>
                    <Edit2 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                  
                  {listing.status === 'active' && (
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none text-yellow-600" onClick={() => { onPause(listing.id); setMenuOpen(false); }}>
                      <Pause className="w-4 h-4 mr-2" /> Pause
                    </Button>
                  )}
                  
                  {listing.status === 'paused' && (
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none text-green-600" onClick={() => { onResume(listing.id); setMenuOpen(false); }}>
                      <Play className="w-4 h-4 mr-2" /> Resume
                    </Button>
                  )}

                  {(listing.status === 'expired' || listing.status === 'sold') && (
                    <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none text-blue-600" onClick={() => { onRepublish(listing.id); setMenuOpen(false); }}>
                      <Copy className="w-4 h-4 mr-2" /> Republish
                    </Button>
                  )}

                  <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none" onClick={copyLink}>
                    <Share2 className="w-4 h-4 mr-2" /> Share Link
                  </Button>
                  
                  <div className="h-px bg-gray-100 my-1" />
                  
                  <Button variant="ghost" className="w-full justify-start text-sm font-normal px-4 py-2 h-auto rounded-none text-red-600" onClick={() => { onDelete(listing.id); setMenuOpen(false); }}>
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </Button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="font-semibold text-lg line-clamp-1">{listing.cropName}</h3>
            <p className="text-sm text-gray-500">
              {listing.variety && `${listing.variety} • `}
              {listing.qualityGrade || 'Standard Grade'}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">₹{listing.pricePerUnit}</p>
            <p className="text-xs text-gray-500">per {listing.unit}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm mb-4">
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs">Quantity</p>
            <p className="font-medium">{listing.quantity} {listing.unit}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded">
            <p className="text-gray-500 text-xs">Selling Mode</p>
            <p className="font-medium capitalize">{listing.sellingMode || 'Direct'}</p>
          </div>
          {listing.harvestDate && (
            <div className="bg-gray-50 p-2 rounded col-span-2">
              <p className="text-gray-500 text-xs">Harvest Date</p>
              <p className="font-medium">{new Date(listing.harvestDate).toLocaleDateString()}</p>
            </div>
          )}
        </div>

        {/* Analytics Mini-bar */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-3 mb-4">
          <div className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900">{listing.views || 0}</span>
              <span className="text-[10px] uppercase">Views</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900">{listing.savedCount || 0}</span>
              <span className="text-[10px] uppercase">Saves</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="font-semibold text-gray-900">{listing.bidsCount || 0}</span>
              <span className="text-[10px] uppercase">Bids</span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-primary hover:text-primary hover:bg-primary/5"
          onClick={() => onViewAnalytics(listing.id)}
        >
          <BarChart2 className="w-4 h-4 mr-2" />
          View Analytics
        </Button>
      </CardContent>
    </Card>
  );
}
