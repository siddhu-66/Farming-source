"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

export default function DeliveryBillingStep() {
  const {
    deliveryAddress,
    deliveryCity,
    deliveryState,
    deliveryPostalCode,
    sameAsDelivery,
    billingAddress,
    billingCity,
    billingState,
    billingPostalCode,
    updateField,
    setStep,
  } = useBuyerOnboardingStore();

  const handleNext = () => setStep(6);
  const handleBack = () => setStep(4);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Delivery & Billing</h2>
        <p className="text-muted-foreground">Set your delivery and billing locations.</p>
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Delivery Address</h3>
        <div className="space-y-2">
          <Label htmlFor="deliveryAddress">Address</Label>
          <Input
            id="deliveryAddress"
            value={deliveryAddress}
            onChange={(e) => updateField("deliveryAddress", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="deliveryCity">City</Label>
            <Input
              id="deliveryCity"
              value={deliveryCity}
              onChange={(e) => updateField("deliveryCity", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryState">State</Label>
            <Input
              id="deliveryState"
              value={deliveryState}
              onChange={(e) => updateField("deliveryState", e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="deliveryPostalCode">Postal Code</Label>
          <Input
            id="deliveryPostalCode"
            value={deliveryPostalCode}
            onChange={(e) => updateField("deliveryPostalCode", e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2 pt-4">
          <Checkbox
            id="sameAsDelivery"
            checked={sameAsDelivery}
            onCheckedChange={(checked) => updateField("sameAsDelivery", !!checked)}
          />
          <Label htmlFor="sameAsDelivery">Billing address is same as delivery</Label>
        </div>

        {!sameAsDelivery && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold text-lg">Billing Address</h3>
            <div className="space-y-2">
              <Label htmlFor="billingAddress">Address</Label>
              <Input
                id="billingAddress"
                value={billingAddress}
                onChange={(e) => updateField("billingAddress", e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="billingCity">City</Label>
                <Input
                  id="billingCity"
                  value={billingCity}
                  onChange={(e) => updateField("billingCity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billingState">State</Label>
                <Input
                  id="billingState"
                  value={billingState}
                  onChange={(e) => updateField("billingState", e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingPostalCode">Postal Code</Label>
              <Input
                id="billingPostalCode"
                value={billingPostalCode}
                onChange={(e) => updateField("billingPostalCode", e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
