"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export default function ProcessingCapacityStep() {
  const { dailyCapacity, monthlyCapacity, annualCapacity, operatingHours, updateField, setStep, currentStep } = useIndustryOnboardingStore();

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Processing Capacity</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="daily">Daily Capacity (Tons)</Label>
            <Input id="daily" type="number" value={dailyCapacity} onChange={(e) => updateField("dailyCapacity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthly">Monthly Capacity (Tons)</Label>
            <Input id="monthly" type="number" value={monthlyCapacity} onChange={(e) => updateField("monthlyCapacity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annual">Annual Capacity (Tons)</Label>
            <Input id="annual" type="number" value={annualCapacity} onChange={(e) => updateField("annualCapacity", Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="hours">Operating Hours</Label>
            <Input id="hours" value={operatingHours} onChange={(e) => updateField("operatingHours", e.target.value)} />
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
