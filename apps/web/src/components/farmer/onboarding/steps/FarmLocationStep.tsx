import { useEffect, useState } from 'react';
import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { MapPin, Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icons
const icon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapEvents({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export function FarmLocationStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();
  const [position, setPosition] = useState<[number, number] | null>(
    store.latitude && store.longitude ? [store.latitude, store.longitude] : null
  );

  useEffect(() => {
    if (position) {
      store.updateField('latitude', position[0]);
      store.updateField('longitude', position[1]);
    }
  }, [position]);

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  const handleNext = () => {
    if (store.state && store.district && store.village && position) {
      onNext();
    }
  };

  const isComplete = store.state && store.district && store.village && position;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Farm Location</h3>
        <p className="text-sm text-muted-foreground">Set your farm's physical location for weather and logistics.</p>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="state">State *</Label>
          <Input id="state" placeholder="State" value={store.state} onChange={(e) => store.updateField('state', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District *</Label>
          <Input id="district" placeholder="District" value={store.district} onChange={(e) => store.updateField('district', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mandal">Mandal / Taluk</Label>
          <Input id="mandal" placeholder="Mandal" value={store.mandal} onChange={(e) => store.updateField('mandal', e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="village">Village *</Label>
          <Input id="village" placeholder="Village" value={store.village} onChange={(e) => store.updateField('village', e.target.value)} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Farm Address (Optional)</Label>
        <Input id="address" placeholder="Full address" value={store.farmAddress} onChange={(e) => store.updateField('farmAddress', e.target.value)} />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Pin Location on Map *</Label>
          <Button variant="outline" size="sm" onClick={handleGetCurrentLocation}>
            <Crosshair className="w-4 h-4 mr-2" />
            Use Current Location
          </Button>
        </div>
        
        <div className="h-64 w-full rounded-lg overflow-hidden border">
          <MapContainer 
            center={position || [20.5937, 78.9629]} // Default to India center
            zoom={position ? 13 : 4} 
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {position && <Marker position={position} icon={icon} />}
            <MapEvents setPosition={setPosition} />
          </MapContainer>
        </div>
        
        {position && (
          <p className="text-xs text-muted-foreground flex items-center">
            <MapPin className="w-3 h-3 mr-1" />
            {position[0].toFixed(6)}, {position[1].toFixed(6)}
          </p>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={handleNext} disabled={!isComplete}>Next Step</Button>
      </div>
    </motion.div>
  );
}
