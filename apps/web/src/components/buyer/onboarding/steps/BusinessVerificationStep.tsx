"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function BusinessVerificationStep() {
  const {
    gstNumber,
    panNumber,
    tradeLicense,
    updateField,
    setStep,
  } = useBuyerOnboardingStore();

  const handleNext = () => setStep(3);
  const handleBack = () => setStep(1);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Business Verification</h2>
        <p className="text-muted-foreground">Provide tax and license details.</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="gstNumber">GST Number</Label>
          <Input
            id="gstNumber"
            value={gstNumber}
            onChange={(e) => updateField("gstNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="panNumber">PAN Number</Label>
          <Input
            id="panNumber"
            value={panNumber}
            onChange={(e) => updateField("panNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tradeLicense">Trade License Number</Label>
          <Input
            id="tradeLicense"
            value={tradeLicense}
            onChange={(e) => updateField("tradeLicense", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
