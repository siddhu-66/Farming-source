"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function ServiceAreaStep() {
  const store = useTransportOnboardingStore();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Service Area</h2>
      
      <div className="grid grid-cols-1 gap-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="radiusKm">Operating Radius (in Km)</Label>
          <Input 
            id="radiusKm" 
            type="number"
            value={store.radiusKm} 
            onChange={(e) => store.updateField("radiusKm", e.target.value ? Number(e.target.value) : '')}
            placeholder="e.g. 50"
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(4)}>Back</Button>
        <Button onClick={() => store.setStep(6)}>Next Step</Button>
      </div>
    </div>
  );
}
