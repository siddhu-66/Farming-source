"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export default function BusinessInfoStep() {
  const {
    businessName,
    businessType,
    ownerName,
    contactPerson,
    mobile,
    email,
    registrationNumber,
    yearsInBusiness,
    website,
    updateField,
    setStep,
  } = useBuyerOnboardingStore();

  const handleNext = () => {
    // Basic validation could go here
    setStep(2);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Business Information</h2>
        <p className="text-muted-foreground">Please provide your primary business details.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => updateField("businessName", e.target.value)}
            placeholder="e.g. AgriCorp Pvt Ltd"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType">Business Type</Label>
          <Input
            id="businessType"
            value={businessType}
            onChange={(e) => updateField("businessType", e.target.value)}
            placeholder="e.g. Wholesaler, Retailer"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input
            id="ownerName"
            value={ownerName}
            onChange={(e) => updateField("ownerName", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contactPerson">Contact Person</Label>
          <Input
            id="contactPerson"
            value={contactPerson}
            onChange={(e) => updateField("contactPerson", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile Number</Label>
          <Input
            id="mobile"
            type="tel"
            value={mobile}
            onChange={(e) => updateField("mobile", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => updateField("email", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="registrationNumber">Registration Number</Label>
          <Input
            id="registrationNumber"
            value={registrationNumber}
            onChange={(e) => updateField("registrationNumber", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="yearsInBusiness">Years in Business</Label>
          <Input
            id="yearsInBusiness"
            type="number"
            value={yearsInBusiness}
            onChange={(e) => updateField("yearsInBusiness", Number(e.target.value) || "")}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="website">Website (Optional)</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => updateField("website", e.target.value)}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
