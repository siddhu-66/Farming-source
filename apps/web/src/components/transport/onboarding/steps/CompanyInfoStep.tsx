"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function CompanyInfoStep() {
  const store = useTransportOnboardingStore();

  const handleNext = () => {
    store.setStep(2);
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Company Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company Name</Label>
          <Input 
            id="companyName" 
            value={store.companyName} 
            onChange={(e) => store.updateField("companyName", e.target.value)}
            placeholder="e.g. Acme Logistics"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="transportType">Transport Type</Label>
          <Input 
            id="transportType" 
            value={store.transportType} 
            onChange={(e) => store.updateField("transportType", e.target.value)}
            placeholder="e.g. Freight, Logistics"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input 
            id="ownerName" 
            value={store.ownerName} 
            onChange={(e) => store.updateField("ownerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input 
            id="contactNumber" 
            value={store.contactNumber} 
            onChange={(e) => store.updateField("contactNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input 
            id="email" 
            type="email"
            value={store.email} 
            onChange={(e) => store.updateField("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input 
            id="gstNumber" 
            value={store.gstNumber} 
            onChange={(e) => store.updateField("gstNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="officeAddress">Office Address</Label>
          <Input 
            id="officeAddress" 
            value={store.officeAddress} 
            onChange={(e) => store.updateField("officeAddress", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end mt-6 pt-4 border-t">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
