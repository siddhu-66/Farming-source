'use client';
import dynamic from 'next/dynamic';
import { Sprout } from 'lucide-react';

const DynamicMapComponent = dynamic(
  () => import('./Map'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-96 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center shadow-inner">
        <div className="flex flex-col items-center text-gray-400">
          <Sprout className="w-12 h-12 mb-4 animate-bounce text-green-500" />
          <p className="text-sm font-medium">Loading Map...</p>
        </div>
      </div>
    )
  }
);

export default DynamicMapComponent;
