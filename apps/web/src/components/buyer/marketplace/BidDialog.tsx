'use client';
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface BidDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
  cropName: string;
  currentPrice: number;
  availableQuantity: number;
  unit: string;
  onSuccess?: () => void;
}

export function BidDialog({ isOpen, onClose, listingId, cropName, currentPrice, availableQuantity, unit, onSuccess }: BidDialogProps) {
  const [offerPrice, setOfferPrice] = useState(currentPrice);
  const [quantity, setQuantity] = useState(availableQuantity);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (offerPrice <= 0 || quantity <= 0) {
      toast.error('Price and quantity must be greater than 0');
      return;
    }
    if (quantity > availableQuantity) {
      toast.error(`Quantity cannot exceed available stock (${availableQuantity} ${unit})`);
      return;
    }

    try {
      setLoading(true);
      await api.post('/marketplace/bids', { listingId, offerPrice, quantity });
      toast.success('Bid placed successfully!');
      onSuccess?.();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place bid');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={`Place Bid for ${cropName}`}>
      <div className="text-sm text-gray-500 mb-4">
        Current asking price is ₹{currentPrice}/{unit}. Enter your offer below.
      </div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium">Your Price (₹)</label>
          <Input 
            type="number" 
            value={offerPrice} 
            onChange={e => setOfferPrice(Number(e.target.value))} 
            className="col-span-3" 
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <label className="text-right text-sm font-medium">Quantity ({unit})</label>
          <Input 
            type="number" 
            value={quantity} 
            max={availableQuantity}
            onChange={e => setQuantity(Number(e.target.value))} 
            className="col-span-3" 
          />
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-sm text-blue-700 dark:text-blue-300">
          Total Offer Value: <strong>₹{(offerPrice * quantity).toLocaleString()}</strong>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Bid'}
        </Button>
      </div>
    </Dialog>
  );
}
