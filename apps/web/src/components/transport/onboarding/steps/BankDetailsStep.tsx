"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function BankDetailsStep() {
  const store = useTransportOnboardingStore();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Bank Details</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-grow">
        <div className="space-y-2">
          <Label htmlFor="bankName">Bank Name</Label>
          <Input 
            id="bankName" 
            value={store.bankName} 
            onChange={(e) => store.updateField("bankName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountHolder">Account Holder Name</Label>
          <Input 
            id="accountHolder" 
            value={store.accountHolder} 
            onChange={(e) => store.updateField("accountHolder", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number</Label>
          <Input 
            id="accountNumber" 
            value={store.accountNumber} 
            onChange={(e) => store.updateField("accountNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ifscCode">IFSC Code</Label>
          <Input 
            id="ifscCode" 
            value={store.ifscCode} 
            onChange={(e) => store.updateField("ifscCode", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(6)}>Back</Button>
        <Button onClick={() => store.setStep(8)}>Next Step</Button>
      </div>
    </div>
  );
}
