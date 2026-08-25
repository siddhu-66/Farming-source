"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function DriverInfoStep() {
  const store = useTransportOnboardingStore();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Driver Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="driverName">Driver Name</Label>
          <Input 
            id="driverName" 
            value={store.driverName} 
            onChange={(e) => store.updateField("driverName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="driverMobile">Mobile Number</Label>
          <Input 
            id="driverMobile" 
            value={store.driverMobile} 
            onChange={(e) => store.updateField("driverMobile", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseNumber">License Number</Label>
          <Input 
            id="licenseNumber" 
            value={store.licenseNumber} 
            onChange={(e) => store.updateField("licenseNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="licenseExpiry">License Expiry</Label>
          <Input 
            id="licenseExpiry" 
            type="date"
            value={store.licenseExpiry} 
            onChange={(e) => store.updateField("licenseExpiry", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(1)}>Back</Button>
        <Button onClick={() => store.setStep(3)}>Next Step</Button>
      </div>
    </div>
  );
}
