"use client";

import React from "react";
import { MapContainer, TileLayer, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function PolygonMapEvents({ points, setPoints }: { points: any[], setPoints: any }) {
  useMapEvents({
    click(e: any) {
      setPoints([...points, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return null;
}

export default function PolygonPicker({ points, setPoints, showEvents = true }: { points: any[], setPoints: any, showEvents?: boolean }) {
  const center = points.length > 0 ? points[0] : [20.5937, 78.9629];
  return (
    <MapContainer center={center} zoom={points.length > 0 ? 15 : 4} style={{ height: "100%", width: "100%", zIndex: 1 }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {showEvents && <PolygonMapEvents points={points} setPoints={setPoints} />}
      {points.length > 0 && <Polygon positions={points} pathOptions={{ color: 'emerald', fillColor: 'emerald' }} />}
    </MapContainer>
  );
}
