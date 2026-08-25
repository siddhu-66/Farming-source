"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function PricingAvailabilityStep() {
  const store = useTransportOnboardingStore();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Pricing & Availability</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="basePrice">Base Price</Label>
          <Input 
            id="basePrice" 
            type="number"
            value={store.basePrice} 
            onChange={(e) => store.updateField("basePrice", e.target.value ? Number(e.target.value) : '')}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="pricePerKm">Price Per Km</Label>
          <Input 
            id="pricePerKm" 
            type="number"
            value={store.pricePerKm} 
            onChange={(e) => store.updateField("pricePerKm", e.target.value ? Number(e.target.value) : '')}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(5)}>Back</Button>
        <Button onClick={() => store.setStep(7)}>Next Step</Button>
      </div>
    </div>
  );
}
