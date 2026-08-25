'use client';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Star, Clock, ShieldCheck, Heart, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ListingCardProps {
  listing: any;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

export function ListingCard({ listing, onSave, isSaved }: ListingCardProps) {
  const router = useRouter();
  const { id, cropName, category, qualityGrade, quantity, unit, price, status, farmerId, address, aiScore, isVerified } = listing;

  const distance = Math.floor(Math.random() * 50) + 2; // Mock distance for UI
  const rating = farmerId?.rating || (4.0 + Math.random()).toFixed(1);
  const isOrganic = listing.organicCertified;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:border-primary/30 transition-all group">
        <div className="relative h-48 bg-gray-100 dark:bg-gray-800 overflow-hidden">
          {/* MOCK IMAGE FOR NOW */}
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🌾
          </div>
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            {isOrganic && <Badge variant="success" className="bg-green-600">Organic</Badge>}
            {status === 'auction' && <Badge variant="warning" className="bg-orange-500">Auction</Badge>}
          </div>
          <div className="absolute top-2 right-2">
            <button 
              onClick={(e) => { e.preventDefault(); onSave && onSave(id); }}
              className="p-2 bg-white/80 dark:bg-black/50 backdrop-blur-md rounded-full hover:bg-primary/20 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-gray-600 dark:text-gray-300'}`} />
            </button>
          </div>
          {aiScore && (
            <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center">
              <ShieldCheck className="w-3 h-3 mr-1 text-green-400" /> AI Score: {Math.round(aiScore)}/100
            </div>
          )}
        </div>

        <CardContent className="flex-1 p-4 flex flex-col">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-bold text-lg leading-tight group-hover:text-primary transition-colors">{cropName}</h3>
            <span className="font-semibold text-lg text-primary">₹{price}<span className="text-sm font-normal text-gray-500">/{unit}</span></span>
          </div>
          
          <div className="text-sm text-gray-500 mb-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs font-normal px-1.5 py-0">{qualityGrade || 'Grade A'}</Badge>
            <span>•</span>
            <span>{quantity} {unit} available</span>
          </div>

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mt-auto">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px]">
                {farmerId?.name?.charAt(0) || 'F'}
              </div>
              <span className="truncate">{farmerId?.name || 'Unknown Farmer'}</span>
              {farmerId?.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />}
              <span className="flex items-center ml-auto text-xs font-medium text-amber-500">
                <Star className="w-3 h-3 fill-current mr-0.5" /> {rating}
              </span>
            </div>
            
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center truncate">
                <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0" />
                <span className="truncate">{address?.district || 'Unknown'}, {address?.state || ''}</span>
              </div>
              <span className="font-medium whitespace-nowrap ml-2">{distance} km away</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" className="w-full" onClick={(e) => { e.preventDefault(); router.push(`/buyer/marketplace/${id}`); }}>
              Details
            </Button>
            <Button size="sm" className="w-full" onClick={(e) => { e.preventDefault(); router.push(`/buyer/marketplace/${id}?action=${status === 'auction' ? 'bid' : 'buy'}`); }}>
              {status === 'auction' ? 'Place Bid' : 'Buy Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
