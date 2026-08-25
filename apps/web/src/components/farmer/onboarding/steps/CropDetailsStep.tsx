import { useState } from 'react';
import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Calendar as CalendarIcon, Edit2, Leaf } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export function CropDetailsStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [category, setCategory] = useState('');
  const [name, setName] = useState('');
  const [variety, setVariety] = useState('');
  const [season, setSeason] = useState('');
  const [cultivatedArea, setCultivatedArea] = useState<number | ''>('');
  const [expectedHarvestDate, setExpectedHarvestDate] = useState('');
  const [estimatedYield, setEstimatedYield] = useState<number | ''>('');

  const resetForm = () => {
    setCategory('');
    setName('');
    setVariety('');
    setSeason('');
    setCultivatedArea('');
    setExpectedHarvestDate('');
    setEstimatedYield('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSaveCrop = () => {
    if (!category || !name || !season || !cultivatedArea || !expectedHarvestDate) return;

    if (editingId) {
      store.updateCrop(editingId, {
        category, name, variety, season, cultivatedArea, expectedHarvestDate, estimatedYield
      });
    } else {
      store.addCrop({
        id: crypto.randomUUID(),
        category, name, variety, season, cultivatedArea, expectedHarvestDate, estimatedYield
      });
    }
    resetForm();
  };

  const handleEditCrop = (crop: any) => {
    setEditingId(crop.id);
    setCategory(crop.category);
    setName(crop.name);
    setVariety(crop.variety || '');
    setSeason(crop.season);
    setCultivatedArea(crop.cultivatedArea);
    setExpectedHarvestDate(crop.expectedHarvestDate);
    setEstimatedYield(crop.estimatedYield || '');
    setIsAdding(true);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Crop Details</h3>
          <p className="text-sm text-muted-foreground">Add the crops currently active on your farm.</p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Crop
          </Button>
        )}
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Crop Category *</Label>
                    <Select 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      options={[
                        { value: '', label: 'Select Category' },
                        { value: 'Cereals', label: 'Cereals' },
                        { value: 'Pulses', label: 'Pulses' },
                        { value: 'Vegetables', label: 'Vegetables' },
                        { value: 'Fruits', label: 'Fruits' },
                        { value: 'Cash Crops', label: 'Cash Crops' }
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Crop Name *</Label>
                    <Input placeholder="e.g. Wheat, Tomato" value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Variety (Optional)</Label>
                    <Input placeholder="e.g. Sharbati" value={variety} onChange={(e) => setVariety(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Season *</Label>
                    <Select 
                      value={season} 
                      onChange={(e) => setSeason(e.target.value)}
                      options={[
                        { value: '', label: 'Select Season' },
                        { value: 'Kharif', label: 'Kharif' },
                        { value: 'Rabi', label: 'Rabi' },
                        { value: 'Zaid', label: 'Zaid' },
                        { value: 'Perennial', label: 'Perennial' }
                      ]}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Area ({store.areaUnit}) *</Label>
                    <Input type="number" placeholder="0" value={cultivatedArea} onChange={(e) => setCultivatedArea(Number(e.target.value) || '')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Harvest Date *</Label>
                    <Input type="date" value={expectedHarvestDate} onChange={(e) => setExpectedHarvestDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Est. Yield (Quintals)</Label>
                    <Input type="number" placeholder="0" value={estimatedYield} onChange={(e) => setEstimatedYield(Number(e.target.value) || '')} />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                  <Button size="sm" onClick={handleSaveCrop} disabled={!category || !name || !season || !cultivatedArea || !expectedHarvestDate}>
                    {editingId ? 'Update Crop' : 'Save Crop'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {store.crops.length === 0 && !isAdding && (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
            <Leaf className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>No crops added yet.</p>
            <Button variant="ghost" onClick={() => setIsAdding(true)}>Add your first crop</Button>
          </div>
        )}

        {store.crops.map((crop) => (
          <div key={crop.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
            <div>
              <div className="font-medium flex items-center gap-2">
                {crop.name} <span className="text-xs font-normal px-2 py-0.5 bg-muted rounded-full">{crop.season}</span>
              </div>
              <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                <span>{crop.cultivatedArea} {store.areaUnit}</span>
                <span className="flex items-center"><CalendarIcon className="w-3 h-3 mr-1" /> {crop.expectedHarvestDate}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEditCrop(crop)}>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => store.removeCrop(crop.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={onNext} disabled={store.crops.length === 0}>Next Step</Button>
      </div>
    </motion.div>
  );
}
