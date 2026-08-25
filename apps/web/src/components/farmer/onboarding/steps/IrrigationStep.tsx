import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { motion } from 'framer-motion';

export function IrrigationStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();

  const isComplete = store.irrigationType && store.waterSource && store.waterAvailability;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Irrigation & Water Management</h3>
        <p className="text-sm text-muted-foreground">Tell us about how you manage water on your farm.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Primary Irrigation Type *</Label>
          <Select 
            value={store.irrigationType} 
            onChange={(e) => store.updateField('irrigationType', e.target.value)}
            options={[
              { value: '', label: 'Select type' },
              { value: 'Drip', label: 'Drip' },
              { value: 'Sprinkler', label: 'Sprinkler' },
              { value: 'Flood', label: 'Flood' },
              { value: 'Rain-fed', label: 'Rain-fed' },
              { value: 'Manual', label: 'Manual' },
              { value: 'Other', label: 'Other' }
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label>Primary Water Source *</Label>
          <Select 
            value={store.waterSource} 
            onChange={(e) => store.updateField('waterSource', e.target.value)}
            options={[
              { value: '', label: 'Select source' },
              { value: 'Borewell', label: 'Borewell' },
              { value: 'Canal', label: 'Canal' },
              { value: 'River', label: 'River' },
              { value: 'Pond', label: 'Pond' },
              { value: 'Rainwater Harvesting', label: 'Rainwater Harvesting' },
              { value: 'Tank', label: 'Tank' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Irrigation Frequency</Label>
            <Select 
              value={store.irrigationFrequency} 
              onChange={(e) => store.updateField('irrigationFrequency', e.target.value)}
              options={[
                { value: '', label: 'e.g. Daily, Weekly' },
                { value: 'Daily', label: 'Daily' },
                { value: 'Every 2-3 Days', label: 'Every 2-3 Days' },
                { value: 'Weekly', label: 'Weekly' },
                { value: 'As needed', label: 'As needed' }
              ]}
            />
          </div>
          <div className="space-y-2">
            <Label>Water Availability *</Label>
            <Select 
              value={store.waterAvailability} 
              onChange={(e) => store.updateField('waterAvailability', e.target.value)}
              options={[
                { value: '', label: 'e.g. Year-round' },
                { value: 'Year-round', label: 'Year-round' },
                { value: 'Seasonal', label: 'Seasonal' },
                { value: 'Scarce', label: 'Scarce' }
              ]}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={onNext} disabled={!isComplete}>Next Step</Button>
      </div>
    </motion.div>
  );
}
