'use client';
import { Truck, Clock, Map } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TransportEstimateProps {
  distance?: number;
  quantity?: number;
}

export function TransportEstimate({ distance = 42, quantity = 500 }: TransportEstimateProps) {
  // Mock logic based on spec
  const vehicle = quantity > 2000 ? 'Heavy Truck' : 'Mini Truck';
  const eta = distance > 100 ? '4-6 Hours' : '2 Hours';
  const estimatedCost = Math.round(distance * 15 + quantity * 0.5); // Mock formula

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Truck className="w-5 h-5 text-primary" /> Transport Estimate
        </h3>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Map className="w-3 h-3" /> Distance</p>
          <p className="font-semibold">{distance} km</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Truck className="w-3 h-3" /> Vehicle</p>
          <p className="font-semibold truncate">{vehicle}</p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1"><Clock className="w-3 h-3" /> ETA</p>
          <p className="font-semibold">{eta}</p>
        </div>
        <div className="p-3 bg-primary/10 rounded-xl border border-primary/20">
          <p className="text-xs text-primary mb-1">Est. Cost</p>
          <p className="font-bold text-primary">₹{estimatedCost.toLocaleString()}</p>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 text-center">
        Final transport cost may vary based on exact drop location and driver availability.
      </p>
    </div>
  );
}
