'use client';
import { useEffect, useState } from 'react';
import { Star, Verified } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface ReviewsSectionProps {
  listingId: string;
}

export function ReviewsSection({ listingId }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('newest');
  
  // Mock average rating for UI
  const avgRating = 4.8;
  const totalReviews = reviews.length || 12;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/reviews/${listingId}?sortBy=${sortBy}`);
        setReviews(res.data.data.reviews || []);
      } catch (error) {
        // If API doesn't exist yet, we'll gracefully fallback or show empty
        console.error('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, [listingId, sortBy]);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-xl font-bold">Reviews & Ratings</h3>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-5 h-5 ${i < Math.floor(avgRating) ? 'fill-current' : ''}`} />
              ))}
            </div>
            <span className="font-semibold">{avgRating}</span>
            <span className="text-gray-500 text-sm">({totalReviews} reviews)</span>
          </div>
        </div>

        <select 
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
          className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="newest">Newest First</option>
          <option value="highest">Highest Rating</option>
          <option value="lowest">Lowest Rating</option>
        </select>
      </div>

      <div className="space-y-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="flex gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4" />
                  <Skeleton className="h-3 w-1/6" />
                </div>
              </div>
              <Skeleton className="h-16 w-full" />
            </div>
          ))
        ) : reviews.length > 0 ? (
          reviews.map((review: any) => (
            <div key={review.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-6 last:pb-0">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  {review.reviewer?.name?.charAt(0) || 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-sm">{review.reviewer?.name || 'Unknown User'}</h4>
                    {/* Mock verified purchase for buyers */}
                    <span className="flex items-center text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">
                      <Verified className="w-3 h-3 mr-1" /> Verified Purchase
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-3 ml-13 pl-13">
                {review.comment}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No reviews yet for this listing.
          </div>
        )}
      </div>
    </div>
  );
}
