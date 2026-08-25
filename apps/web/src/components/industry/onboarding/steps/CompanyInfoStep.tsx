"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function CompanyInfoStep() {
  const { 
    companyName, industryType, registrationNumber, gstNumber, panNumber, companyEmail, contactNumber, website,
    updateField, setStep, currentStep 
  } = useIndustryOnboardingStore();

  const handleNext = () => setStep(currentStep + 1);

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Company Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input id="companyName" value={companyName} onChange={(e) => updateField("companyName", e.target.value)} placeholder="Enter company name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industryType">Industry Type</Label>
            <Input id="industryType" value={industryType} onChange={(e) => updateField("industryType", e.target.value)} placeholder="e.g. Food Processing" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input id="registrationNumber" value={registrationNumber} onChange={(e) => updateField("registrationNumber", e.target.value)} placeholder="Reg Number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gstNumber">GST Number</Label>
            <Input id="gstNumber" value={gstNumber} onChange={(e) => updateField("gstNumber", e.target.value)} placeholder="GST Number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="panNumber">PAN Number</Label>
            <Input id="panNumber" value={panNumber} onChange={(e) => updateField("panNumber", e.target.value)} placeholder="PAN Number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="companyEmail">Company Email</Label>
            <Input id="companyEmail" type="email" value={companyEmail} onChange={(e) => updateField("companyEmail", e.target.value)} placeholder="Email" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number</Label>
            <Input id="contactNumber" value={contactNumber} onChange={(e) => updateField("contactNumber", e.target.value)} placeholder="Contact Number" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="website">Website (Optional)</Label>
            <Input id="website" value={website} onChange={(e) => updateField("website", e.target.value)} placeholder="https://" />
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
