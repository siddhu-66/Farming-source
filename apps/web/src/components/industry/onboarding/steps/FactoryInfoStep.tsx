"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function FactoryInfoStep() {
  const { 
    factoryName, factoryAddress, state, district, city, postalCode, numberOfEmployees, workingShifts,
    updateField, setStep, currentStep 
  } = useIndustryOnboardingStore();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Factory Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="factoryName">Factory Name</Label>
            <Input id="factoryName" value={factoryName} onChange={(e) => updateField("factoryName", e.target.value)} />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="factoryAddress">Address</Label>
            <textarea id="factoryAddress" className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" value={factoryAddress} onChange={(e) => updateField("factoryAddress", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input id="state" value={state} onChange={(e) => updateField("state", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="district">District</Label>
            <Input id="district" value={district} onChange={(e) => updateField("district", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input id="city" value={city} onChange={(e) => updateField("city", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input id="postalCode" value={postalCode} onChange={(e) => updateField("postalCode", e.target.value)} />
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
