import { useFarmerOnboardingStore } from '@/stores/farmerOnboardingStore';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { motion } from 'framer-motion';
import { Landmark } from 'lucide-react';

export function GovernmentSchemesStep({ onNext, onPrev }: { onNext: () => void; onPrev: () => void }) {
  const store = useFarmerOnboardingStore();

  return (
    <motion.div className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div>
        <h3 className="text-lg font-medium">Government Schemes</h3>
        <p className="text-sm text-muted-foreground">Select the schemes you are currently enrolled in for better subsidy recommendations.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-primary" />
              PM-KISAN Beneficiary
            </Label>
            <p className="text-sm text-muted-foreground">Are you receiving PM-KISAN installments?</p>
          </div>
          <Switch checked={store.pmKisanBeneficiary} onCheckedChange={(c) => store.updateField('pmKisanBeneficiary', c)} />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-primary" />
              Soil Health Card
            </Label>
            <p className="text-sm text-muted-foreground">Do you have an active Soil Health Card?</p>
          </div>
          <Switch checked={store.soilHealthCard} onCheckedChange={(c) => store.updateField('soilHealthCard', c)} />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-primary" />
              Crop Insurance (PMFBY)
            </Label>
            <p className="text-sm text-muted-foreground">Is your crop insured under PMFBY?</p>
          </div>
          <Switch checked={store.cropInsurance} onCheckedChange={(c) => store.updateField('cropInsurance', c)} />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-primary" />
              Kisan Credit Card (KCC)
            </Label>
            <p className="text-sm text-muted-foreground">Do you have an active KCC loan account?</p>
          </div>
          <Switch checked={store.kisanCreditCard} onCheckedChange={(c) => store.updateField('kisanCreditCard', c)} />
        </div>

        <div className="flex items-center justify-between border p-4 rounded-lg bg-card">
          <div className="space-y-0.5">
            <Label className="text-base flex items-center">
              <Landmark className="w-4 h-4 mr-2 text-primary" />
              FPO Member
            </Label>
            <p className="text-sm text-muted-foreground">Are you part of a Farmer Producer Organization?</p>
          </div>
          <Switch checked={store.fpoMember} onCheckedChange={(c) => store.updateField('fpoMember', c)} />
        </div>
      </div>

      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onPrev}>Back</Button>
        <Button onClick={onNext}>Review Profile</Button>
      </div>
    </motion.div>
  );
}
