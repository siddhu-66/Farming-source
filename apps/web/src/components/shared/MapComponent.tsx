import React from 'react';
import { Card } from '@/components/ui/Card';
import { MapPin, Navigation } from 'lucide-react';

interface MapComponentProps {
  center: [number, number];
  zoom: number;
  className?: string;
  markers?: Array<{
    position: [number, number];
    role: string;
    title: string;
    subtitle?: string;
  }>;
  routes?: Array<{
    start: [number, number];
    end: [number, number];
    color: string;
  }>;
}

export default function MapComponent({ center, zoom, className, markers, routes }: MapComponentProps) {
  // A mock visual representation of a map since leaflet is tricky in SSR
  return (
    <div className={`relative bg-blue-50 dark:bg-gray-800 rounded-lg overflow-hidden ${className}`}>
      {/* Background Map Mock */}
      <div className="absolute inset-0 opacity-40 bg-[url('https://maps.wikimedia.org/osm-intl/12/2927/1770.png')] bg-cover bg-center mix-blend-multiply dark:mix-blend-overlay"></div>
      
      {/* Interactive Elements Layer */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="relative w-full h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl">
          
          {/* Mock Markers */}
          {markers?.map((marker, idx) => {
            // Rough calculation for positioning based on simple lat/lng logic
            const top = `${Math.min(90, Math.max(10, 50 + (center[0] - marker.position[0]) * 5))}%`;
            const left = `${Math.min(90, Math.max(10, 50 + (marker.position[1] - center[1]) * 5))}%`;
            
            return (
              <div 
                key={idx} 
                className="absolute transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                style={{ top, left }}
              >
                <div className={`p-1.5 rounded-full shadow-lg ${marker.role === 'transport' ? 'bg-primary' : marker.role === 'buyer' ? 'bg-orange-500' : 'bg-blue-500'} text-white`}>
                  {marker.role === 'transport' ? <Navigation className="w-4 h-4 fill-current rotate-45" /> : <MapPin className="w-4 h-4" />}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-8 bg-white dark:bg-gray-800 shadow-lg rounded-md px-2 py-1 text-xs whitespace-nowrap z-50">
                  <p className="font-bold">{marker.title}</p>
                  {marker.subtitle && <p className="text-gray-500">{marker.subtitle}</p>}
                </div>
              </div>
            );
          })}

          {/* Fallback center marker */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center animate-ping absolute"></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-white relative z-10 shadow-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
