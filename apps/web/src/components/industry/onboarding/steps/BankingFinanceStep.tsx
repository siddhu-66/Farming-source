"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function BankingFinanceStep() {
  const { bankName, accountHolder, accountNumber, ifscCode, upiId, updateField, setStep, currentStep } = useIndustryOnboardingStore();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Banking & Finance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="bankName">Bank Name</Label>
            <Input id="bankName" value={bankName} onChange={(e) => updateField("bankName", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountHolder">Account Holder Name</Label>
            <Input id="accountHolder" value={accountHolder} onChange={(e) => updateField("accountHolder", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="accountNumber">Account Number</Label>
            <Input id="accountNumber" value={accountNumber} onChange={(e) => updateField("accountNumber", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ifscCode">IFSC Code</Label>
            <Input id="ifscCode" value={ifscCode} onChange={(e) => updateField("ifscCode", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="upiId">UPI ID (Optional)</Label>
            <Input id="upiId" value={upiId} onChange={(e) => updateField("upiId", e.target.value)} />
          </div>
        </div>
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(currentStep - 1)}>Back</Button>
        <Button onClick={() => setStep(currentStep + 1)}>Next Step</Button>
      </div>
    </div>
  );
}
