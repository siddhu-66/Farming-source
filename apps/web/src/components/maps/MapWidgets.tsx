'use client';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { useEffect, useState } from 'react';

// Custom icons based on roles
export const customIcons = {
  farmer: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/1995/1995515.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  buyer: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/3358/3358602.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  industry: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/10317/10317134.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  transport: new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/2765/2765103.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
};

interface LocationMarkerProps {
  position: [number, number];
  role: 'farmer' | 'buyer' | 'industry' | 'transport';
  title: string;
  subtitle?: string;
  details?: string;
}

export const LocationMarker = ({ position, role, title, subtitle, details }: LocationMarkerProps) => {
  return (
    <Marker position={position} icon={customIcons[role]}>
      <Popup>
        <div className="p-1">
          <h3 className="font-bold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm font-semibold text-gray-600">{subtitle}</p>}
          {details && <p className="text-sm text-gray-500 mt-1">{details}</p>}
        </div>
      </Popup>
    </Marker>
  );
};

interface RouteDisplayProps {
  start: [number, number];
  end: [number, number];
  color?: string;
}

export const RouteDisplay = ({ start, end, color = 'blue' }: RouteDisplayProps) => {
  return (
    <Polyline 
      positions={[start, end]} 
      pathOptions={{ color, weight: 4, dashArray: '10, 10' }} 
    />
  );
};
