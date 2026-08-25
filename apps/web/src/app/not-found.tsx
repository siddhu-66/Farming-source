'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', bounce: 0.5 }}
      >
        <h1 className="text-9xl font-extrabold text-gray-200 dark:text-gray-800">404</h1>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-4xl text-primary font-bold bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm px-4 py-2 rounded-lg">
            Lost in the fields?
          </span>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mt-8 space-y-6"
      >
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto text-lg">
          We couldn't find the page you're looking for. It might have been moved or deleted.
        </p>
        <Link href="/">
          <Button size="lg" className="rounded-full">Return Home</Button>
        </Link>
      </motion.div>
    </div>
  );
}
