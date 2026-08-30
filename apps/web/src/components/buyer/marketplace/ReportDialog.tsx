'use client';
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import api from '@/lib/api';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  listingId: string;
}

const REASONS = [
  'Spam',
  'Wrong Crop',
  'Fake Images',
  'Offensive Content',
  'Fraud',
  'Duplicate Listing',
  'Other'
];

export function ReportDialog({ isOpen, onClose, listingId }: ReportDialogProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      await api.post('/marketplace/reports', { listingId, reason });
      toast.success('Listing reported successfully. Our team will review it.');
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to report listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="⚠️ Report Listing">
      <div className="text-sm text-gray-500 mb-4">
        Please tell us why you are reporting this listing. This will be sent to the moderation queue.
      </div>
      <div className="grid gap-4 py-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Select a reason:</label>
          <select 
            value={reason} 
            onChange={e => setReason(e.target.value)} 
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md bg-transparent"
          >
            {REASONS.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
        <Button variant="danger" onClick={handleSubmit} disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Report'}
        </Button>
      </div>
    </Dialog>
  );
}
