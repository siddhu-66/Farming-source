'use client';
import { useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-red-100 dark:border-red-900/30">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50 mb-6">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Something went wrong!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          An unexpected error occurred. Our team has been notified.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={() => window.location.reload()} variant="outline">Reload Page</Button>
          <Button onClick={() => reset()} variant="primary">Try Again</Button>
        </div>
      </motion.div>
    </div>
  );
}
