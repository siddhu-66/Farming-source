import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Checkbox } from '@/components/ui/Checkbox';
import { motion } from 'framer-motion';

const STORAGE_OPTIONS = ['Warehouse', 'Cold Storage', 'Grain Storage', 'None'];
const LIVESTOCK_OPTIONS = ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Poultry', 'Fish Farming'];

export function StorageLivestockStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();

  const handleStorageChange = (type: string, checked: boolean) => {
    if (type === 'None' && checked) {
      store.updateField('storageType', ['None']);
      return;
    }
    
    let current = store.storageType.filter(t => t !== 'None');
    if (checked) {
      current = [...current, type];
    } else {
      current = current.filter(t => t !== type);
    }
    store.updateField('storageType', current);
  };

  const handleLivestockChange = (type: string, checked: boolean) => {
    let current = [...store.livestock];
    if (checked) {
      current = [...current, type];
    } else {
      current = current.filter(t => t !== type);
    }
    store.updateField('livestock', current);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Storage & Livestock</h3>
        <p className="text-sm text-muted-foreground">Optional information to enable marketplace features.</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label className="text-base mb-3 block">Storage Facilities</Label>
          <div className="grid grid-cols-2 gap-3">
            {STORAGE_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={`storage-${option}`} 
                  checked={store.storageType.includes(option)}
                  onCheckedChange={(checked) => handleStorageChange(option, checked as boolean)}
                />
                <Label htmlFor={`storage-${option}`} className="font-normal cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Label className="text-base mb-3 block">Livestock</Label>
          <div className="grid grid-cols-2 gap-3">
            {LIVESTOCK_OPTIONS.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <Checkbox 
                  id={`livestock-${option}`} 
                  checked={store.livestock.includes(option)}
                  onCheckedChange={(checked) => handleLivestockChange(option, checked as boolean)}
                />
                <Label htmlFor={`livestock-${option}`} className="font-normal cursor-pointer">{option}</Label>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </motion.div>
  );
}
