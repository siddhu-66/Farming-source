'use client';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

export default function AuctionsPage() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Auctions</h1>
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
        <h2 className="text-xl font-medium text-gray-500">This page is under construction.</h2>
        <p className="text-gray-400 mt-2">The Auctions module will be implemented here.</p>
      </motion.div>
    </div>
  );
}
