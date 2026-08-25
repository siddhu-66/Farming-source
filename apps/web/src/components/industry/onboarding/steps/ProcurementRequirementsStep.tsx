"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ProcurementRequirementsStep() {
  const { minOrderQuantity, maxOrderQuantity, preferredQualityGrade, purchaseFrequency, updateField, setStep, currentStep } = useIndustryOnboardingStore();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Procurement Requirements</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="minOrder">Min Order Quantity (Tons)</Label>
            <Input id="minOrder" type="number" value={minOrderQuantity} onChange={(e) => updateField("minOrderQuantity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxOrder">Max Order Quantity (Tons)</Label>
            <Input id="maxOrder" type="number" value={maxOrderQuantity} onChange={(e) => updateField("maxOrderQuantity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="qualityGrade">Preferred Quality Grade</Label>
            <Input id="qualityGrade" value={preferredQualityGrade} onChange={(e) => updateField("preferredQualityGrade", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Purchase Frequency</Label>
            <Input id="frequency" value={purchaseFrequency} onChange={(e) => updateField("purchaseFrequency", e.target.value)} />
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
