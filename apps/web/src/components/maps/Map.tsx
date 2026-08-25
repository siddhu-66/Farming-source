'use client';
import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationMarker, RouteDisplay } from './MapWidgets';

// Fix for default marker icons
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
};

interface MapProps {
  center: [number, number];
  zoom: number;
  className?: string;
  markers?: Array<{ position: [number, number]; role: 'farmer' | 'buyer' | 'industry' | 'transport'; title: string; subtitle?: string; details?: string }>;
  routes?: Array<{ start: [number, number]; end: [number, number]; color?: string }>;
}

export default function Map({ center, zoom, className = 'w-full h-96 rounded-lg shadow-md z-0', markers = [], routes = [] }: MapProps) {
  useEffect(() => {
    fixLeafletIcons();
  }, []);

  return (
    <MapContainer center={center} zoom={zoom} className={className} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {markers.map((m, i) => (
        <LocationMarker key={`marker-${i}`} {...m} />
      ))}
      
      {routes.map((r, i) => (
        <RouteDisplay key={`route-${i}`} {...r} />
      ))}
    </MapContainer>
  );
}
