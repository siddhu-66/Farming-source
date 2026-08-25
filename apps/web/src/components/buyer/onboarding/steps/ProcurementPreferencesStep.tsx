"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";

const AVAILABLE_CATEGORIES = [
  "Cereals", "Pulses", "Fruits", "Vegetables", "Spices", "Oilseeds"
];

export default function ProcurementPreferencesStep() {
  const {
    categories,
    dailyCapacity,
    monthlyCapacity,
    annualCapacity,
    preferredRadiusKm,
    procurementSchedule,
    toggleCategory,
    updateField,
    setStep,
  } = useBuyerOnboardingStore();

  const handleNext = () => setStep(5);
  const handleBack = () => setStep(3);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Procurement Preferences</h2>
        <p className="text-muted-foreground">What and how much do you want to buy?</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Product Categories</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {AVAILABLE_CATEGORIES.map((cat) => (
              <div key={cat} className="flex items-center space-x-2">
                <Checkbox
                  id={`cat-${cat}`}
                  checked={categories.includes(cat)}
                  onCheckedChange={() => toggleCategory(cat)}
                />
                <Label htmlFor={`cat-${cat}`}>{cat}</Label>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dailyCapacity">Daily Capacity (Tons)</Label>
            <Input
              id="dailyCapacity"
              type="number"
              value={dailyCapacity}
              onChange={(e) => updateField("dailyCapacity", Number(e.target.value) || "")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="monthlyCapacity">Monthly Capacity (Tons)</Label>
            <Input
              id="monthlyCapacity"
              type="number"
              value={monthlyCapacity}
              onChange={(e) => updateField("monthlyCapacity", Number(e.target.value) || "")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="annualCapacity">Annual Capacity (Tons)</Label>
            <Input
              id="annualCapacity"
              type="number"
              value={annualCapacity}
              onChange={(e) => updateField("annualCapacity", Number(e.target.value) || "")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preferredRadiusKm">Preferred Radius (Km)</Label>
            <Input
              id="preferredRadiusKm"
              type="number"
              value={preferredRadiusKm}
              onChange={(e) => updateField("preferredRadiusKm", Number(e.target.value) || 0)}
            />
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
