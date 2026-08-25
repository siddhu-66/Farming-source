"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

const PAYMENT_METHODS = ["Bank Transfer", "UPI", "Cheque", "Credit"];

export default function PaymentPreferencesStep() {
  const {
    paymentMethods,
    paymentTerms,
    bankName,
    accountHolder,
    accountNumber,
    ifscCode,
    togglePaymentMethod,
    updateField,
    setStep,
  } = useBuyerOnboardingStore();

  const handleNext = () => setStep(7);
  const handleBack = () => setStep(5);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Payment Preferences</h2>
        <p className="text-muted-foreground">How do you intend to pay for your procurements?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Payment Methods</Label>
          <div className="grid grid-cols-2 gap-2">
            {PAYMENT_METHODS.map((method) => (
              <div key={method} className="flex items-center space-x-2">
                <Checkbox
                  id={`method-${method}`}
                  checked={paymentMethods.includes(method)}
                  onCheckedChange={() => togglePaymentMethod(method)}
                />
                <Label htmlFor={`method-${method}`}>{method}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="paymentTerms">Preferred Payment Terms</Label>
          <Input
            id="paymentTerms"
            value={paymentTerms}
            onChange={(e) => updateField("paymentTerms", e.target.value)}
            placeholder="e.g. 100% Advance, Net 30"
          />
        </div>

        <div className="pt-4 space-y-4">
          <h3 className="font-semibold text-lg">Bank Account Details (Optional)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Input
                id="bankName"
                value={bankName}
                onChange={(e) => updateField("bankName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountHolder">Account Holder Name</Label>
              <Input
                id="accountHolder"
                value={accountHolder}
                onChange={(e) => updateField("accountHolder", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                type="password"
                value={accountNumber}
                onChange={(e) => updateField("accountNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ifscCode">IFSC Code</Label>
              <Input
                id="ifscCode"
                value={ifscCode}
                onChange={(e) => updateField("ifscCode", e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
