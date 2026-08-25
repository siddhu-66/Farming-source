import { useState } from 'react';
import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select } from '@/components/ui/Select';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Tractor } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';

export function EquipmentStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState<number | ''>('');
  const [workingCondition, setWorkingCondition] = useState('');

  const resetForm = () => {
    setName('');
    setMake('');
    setModel('');
    setYear('');
    setWorkingCondition('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = () => {
    if (!name || !workingCondition) return;

    if (editingId) {
      store.updateEquipment(editingId, { name, make, model, year, workingCondition });
    } else {
      store.addEquipment({ id: crypto.randomUUID(), name, make, model, year, workingCondition });
    }
    resetForm();
  };

  const handleEdit = (eq: any) => {
    setEditingId(eq.id);
    setName(eq.name);
    setMake(eq.make || '');
    setModel(eq.model || '');
    setYear(eq.year || '');
    setWorkingCondition(eq.workingCondition);
    setIsAdding(true);
  };

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Farm Equipment</h3>
          <p className="text-sm text-muted-foreground">List your major farm equipment and machinery.</p>
        </div>
        {!isAdding && (
          <Button size="sm" onClick={() => setIsAdding(true)} variant="outline">
            <Plus className="w-4 h-4 mr-2" /> Add Equipment
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
                    <Label>Equipment Type *</Label>
                    <Select 
                      value={name} 
                      onChange={(e) => setName(e.target.value)}
                      options={[
                        { value: '', label: 'Select Equipment' },
                        { value: 'Tractor', label: 'Tractor' },
                        { value: 'Power Tiller', label: 'Power Tiller' },
                        { value: 'Harvester', label: 'Harvester' },
                        { value: 'Rotavator', label: 'Rotavator' },
                        { value: 'Seed Drill', label: 'Seed Drill' },
                        { value: 'Water Pump', label: 'Water Pump' },
                        { value: 'Sprayer', label: 'Sprayer' },
                        { value: 'Drone', label: 'Drone' },
                        { value: 'Cultivator', label: 'Cultivator' },
                        { value: 'Other', label: 'Other' }
                      ]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Make / Brand</Label>
                    <Input placeholder="e.g. Mahindra, John Deere" value={make} onChange={(e) => setMake(e.target.value)} />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <Input placeholder="e.g. 575 DI" value={model} onChange={(e) => setModel(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Year of Purchase</Label>
                    <Input type="number" placeholder="2020" value={year} onChange={(e) => setYear(Number(e.target.value) || '')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Condition *</Label>
                    <Select 
                      value={workingCondition} 
                      onChange={(e) => setWorkingCondition(e.target.value)}
                      options={[
                        { value: '', label: 'Select Condition' },
                        { value: 'Excellent', label: 'Excellent' },
                        { value: 'Good', label: 'Good' },
                        { value: 'Needs Repair', label: 'Needs Repair' }
                      ]}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" onClick={resetForm}>Cancel</Button>
                  <Button size="sm" onClick={handleSave} disabled={!name || !workingCondition}>
                    {editingId ? 'Update' : 'Save'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        {store.equipment.length === 0 && !isAdding && (
          <div className="text-center py-8 border border-dashed rounded-lg text-muted-foreground">
            <Tractor className="w-8 h-8 mx-auto mb-2 opacity-20" />
            <p>No equipment added yet.</p>
            <p className="text-xs mt-1">You can skip this if you do not own machinery.</p>
          </div>
        )}

        {store.equipment.map((eq) => (
          <div key={eq.id} className="flex items-center justify-between p-3 border rounded-lg bg-card shadow-sm">
            <div>
              <div className="font-medium flex items-center gap-2">
                {eq.name} {eq.make && <span className="text-sm font-normal text-muted-foreground">({eq.make} {eq.model})</span>}
              </div>
              <div className="text-xs text-muted-foreground flex gap-3 mt-1">
                {eq.year && <span>Purchased: {eq.year}</span>}
                <span>Condition: {eq.workingCondition}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleEdit(eq)}>
                <Edit2 className="w-4 h-4 text-muted-foreground" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-destructive" onClick={() => store.removeEquipment(eq.id)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </motion.div>
  );
}
