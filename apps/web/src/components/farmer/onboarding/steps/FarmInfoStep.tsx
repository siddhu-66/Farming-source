import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { motion } from 'framer-motion';

export function FarmInfoStep({ onNext }: { onNext: () => void }) {
  const store = useFarmerOnboardingStore();

  const handleNext = () => {
    if (store.farmName && store.farmerType && store.totalArea && store.numberOfFields) {
      onNext();
    }
  };

  const isComplete = store.farmName && store.farmerType && store.totalArea && store.numberOfFields;

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Farm Information</h3>
        <p className="text-sm text-muted-foreground">Tell us the basic details about your farm.</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="farmName">Farm Name *</Label>
          <Input 
            id="farmName" 
            placeholder="e.g. Green Acres Farm" 
            value={store.farmName} 
            onChange={(e) => store.updateField('farmName', e.target.value)} 
          />
        </div>
        
        <div className="space-y-2">
          <Label>Farmer Type *</Label>
          <Select 
            value={store.farmerType} 
            onChange={(e) => store.updateField('farmerType', e.target.value)}
            options={[
              { value: '', label: 'Select type' },
              { value: 'Owner', label: 'Owner' },
              { value: 'Tenant', label: 'Tenant' },
              { value: 'Cooperative', label: 'Cooperative' }
            ]}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="totalArea">Total Land Area *</Label>
            <Input 
              id="totalArea" 
              type="number"
              placeholder="0" 
              value={store.totalArea} 
              onChange={(e) => store.updateField('totalArea', Number(e.target.value) || '')} 
            />
          </div>
          <div className="space-y-2">
            <Label>Area Unit *</Label>
            <Select 
              value={store.areaUnit} 
              onChange={(e) => store.updateField('areaUnit', e.target.value)}
              options={[
                { value: '', label: 'Select unit' },
                { value: 'Acres', label: 'Acres' },
                { value: 'Hectares', label: 'Hectares' }
              ]}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="numberOfFields">Number of Fields *</Label>
            <Input 
              id="numberOfFields" 
              type="number"
              placeholder="e.g. 2" 
              value={store.numberOfFields} 
              onChange={(e) => store.updateField('numberOfFields', Number(e.target.value) || '')} 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input 
              id="yearsOfExperience" 
              type="number"
              placeholder="e.g. 10" 
              value={store.yearsOfExperience} 
              onChange={(e) => store.updateField('yearsOfExperience', Number(e.target.value) || '')} 
            />
          </div>
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg">
          <div className="space-y-0.5">
            <Label className="text-base">Organic Certified</Label>
            <p className="text-sm text-muted-foreground">Is your farm organically certified?</p>
          </div>
          <Switch 
            checked={store.organicCertified} 
            onCheckedChange={(checked) => store.updateField('organicCertified', checked)} 
          />
        </div>

        {store.organicCertified && (
          <div className="space-y-2">
            <Label htmlFor="certificationNumber">Certification Number</Label>
            <Input 
              id="certificationNumber" 
              placeholder="Enter certification ID" 
              value={store.certificationNumber} 
              onChange={(e) => store.updateField('certificationNumber', e.target.value)} 
            />
          </div>
        )}
      </div>

      <div className="flex justify-end pt-6">
        <Button onClick={handleNext} disabled={!isComplete}>Next Step</Button>
      </div>
    </motion.div>
  );
}
