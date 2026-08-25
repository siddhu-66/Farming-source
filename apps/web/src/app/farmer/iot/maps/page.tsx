"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ArrowLeft, Map as MapIcon, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useRouter } from "next/navigation";
import 'leaflet/dist/leaflet.css';

// Dynamically import Leaflet components to disable SSR since Leaflet requires `window`
const MapContainer = dynamic(() => import('react-leaflet').then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then((mod) => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then((mod) => mod.Popup), { ssr: false });
const Polygon = dynamic(() => import('react-leaflet').then((mod) => mod.Polygon), { ssr: false });

export default function FarmMap() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Fix Leaflet marker icons in Next.js
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
    });
  }, []);

  const farmCenter: [number, number] = [18.5204, 73.8567]; // Pune Coordinates
  
  const zoneCoords: [number, number][] = [
    [18.521, 73.856],
    [18.522, 73.857],
    [18.521, 73.858],
    [18.520, 73.857]
  ];

  if (!mounted) return null;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-24">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Farm Mapping</h1>
          <p className="text-muted-foreground">Interactive map of your farm zones and IoT device locations.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Map Container */}
        <div className="lg:col-span-3 h-[600px] rounded-3xl overflow-hidden border shadow-xl z-0">
          <MapContainer center={farmCenter} zoom={16} style={{ height: '100%', width: '100%' }} zoomControl={false}>
            <TileLayer
              attribution='&copy; OpenStreetMap contributors'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            
            <Polygon positions={zoneCoords} pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.3 }}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800">North Field</h3>
                  <p className="text-xs text-slate-500">Tomato • 2.5 Acres</p>
                </div>
              </Popup>
            </Polygon>

            <Marker position={[18.521, 73.857]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800">Soil Sensor Node 1</h3>
                  <p className="text-xs text-blue-600 font-bold">Online • 85% Battery</p>
                  <p className="text-xs text-slate-500 mt-1">Moisture: 42%</p>
                </div>
              </Popup>
            </Marker>
            
            <Marker position={[18.5205, 73.8565]}>
              <Popup>
                <div className="text-center">
                  <h3 className="font-bold text-slate-800">Main Valve Controller</h3>
                  <p className="text-xs text-emerald-600 font-bold">Online • Wired Power</p>
                </div>
              </Popup>
            </Marker>

          </MapContainer>
        </div>

        {/* Legend / Status */}
        <div className="space-y-4">
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <MapIcon className="w-5 h-5 text-emerald-600" /> Farm Zones
              </h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="w-4 h-4 bg-emerald-500 rounded-sm" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm">North Field</p>
                    <p className="text-xs text-slate-500">2.5 Acres • Tomato</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border">
                  <div className="w-4 h-4 bg-amber-500 rounded-sm opacity-30" />
                  <div>
                    <p className="font-bold text-slate-800 text-sm opacity-50">South Field</p>
                    <p className="text-xs text-slate-500 opacity-50">Draft Zone</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-4">
                <ShieldAlert className="w-5 h-5 text-blue-600" /> Device Legend
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <img src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png" className="h-6" alt="Marker" />
                  <span className="font-medium text-slate-700">Sensor / Controller</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center"><div className="w-2 h-2 bg-emerald-500 rounded-full" /></div>
                  <span className="font-medium text-slate-700">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center"><div className="w-2 h-2 bg-red-500 rounded-full" /></div>
                  <span className="font-medium text-slate-700">Offline / Alert</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}
