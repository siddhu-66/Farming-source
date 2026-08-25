import { useState, useEffect } from 'react';
import { useOnboardingStore } from '@/stores/onboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MapPin } from 'lucide-react';

export function AddressConfirmationStep({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const { data, updateData } = useOnboardingStore();
  
  const [formData, setFormData] = useState({
    country: data.address?.country || 'India',
    state: data.address?.state || '',
    district: data.address?.district || '',
    mandal: data.address?.mandal || '',
    village: data.address?.village || '',
    streetAddress: data.address?.streetAddress || '',
    postalCode: data.address?.postalCode || '',
    coordinates: data.address?.coordinates || null
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLocating, setIsLocating] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.country) newErrors.country = 'Country is required';
    if (!formData.state) newErrors.state = 'State is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.village) newErrors.village = 'City/Village is required';
    if (!formData.postalCode) newErrors.postalCode = 'Postal Code is required';
    else if (!/^\d{5,6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Invalid postal code format';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    updateData('address', formData);
    onNext();
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            coordinates: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            }
          }));
          setIsLocating(false);
        },
        (error) => {
          console.error("Error obtaining location", error);
          alert("Could not get location. Please allow location access.");
          setIsLocating(false);
        }
      );
    } else {
      setIsLocating(false);
      alert("Geolocation is not supported by your browser");
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-primary/5 p-4 rounded-lg flex items-center justify-between border border-primary/20">
        <div>
          <h4 className="font-medium text-sm">Location Coordinates</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {formData.coordinates 
              ? `${formData.coordinates.latitude.toFixed(4)}, ${formData.coordinates.longitude.toFixed(4)}`
              : 'Not captured yet'}
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={handleUseCurrentLocation} disabled={isLocating} className="gap-2">
          <MapPin className="w-4 h-4" />
          {isLocating ? 'Locating...' : 'Get Current Location'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Country *</label>
          <Input 
            name="country" 
            value={formData.country} 
            onChange={handleChange}
            className={errors.country ? 'border-red-500' : ''}
          />
          {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State *</label>
          <Input 
            name="state" 
            value={formData.state} 
            onChange={handleChange}
            className={errors.state ? 'border-red-500' : ''}
          />
          {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">District *</label>
          <Input 
            name="district" 
            value={formData.district} 
            onChange={handleChange}
            className={errors.district ? 'border-red-500' : ''}
          />
          {errors.district && <p className="text-red-500 text-xs mt-1">{errors.district}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mandal / Taluk (Optional)</label>
          <Input 
            name="mandal" 
            value={formData.mandal} 
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Village / City *</label>
          <Input 
            name="village" 
            value={formData.village} 
            onChange={handleChange}
            className={errors.village ? 'border-red-500' : ''}
          />
          {errors.village && <p className="text-red-500 text-xs mt-1">{errors.village}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Postal Code *</label>
          <Input 
            name="postalCode" 
            value={formData.postalCode} 
            onChange={handleChange}
            className={errors.postalCode ? 'border-red-500' : ''}
          />
          {errors.postalCode && <p className="text-red-500 text-xs mt-1">{errors.postalCode}</p>}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Street Address (Optional)</label>
        <Input 
          name="streetAddress" 
          value={formData.streetAddress} 
          onChange={handleChange}
        />
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="ghost" onClick={onPrev}>Previous</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
