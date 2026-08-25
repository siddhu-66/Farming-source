"use client";

import { useBuyerOnboardingStore, Warehouse } from "@/stores/buyerOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function WarehouseDetailsStep() {
  const { warehouses, addWarehouse, removeWarehouse, setStep } = useBuyerOnboardingStore();

  const handleAddWarehouse = () => {
    const newWarehouse: Warehouse = {
      id: Math.random().toString(36).substr(2, 9),
      name: "",
      address: "",
      state: "",
      district: "",
      city: "",
      postalCode: "",
      capacityTons: "",
      coldStorage: false,
      latitude: null,
      longitude: null,
    };
    addWarehouse(newWarehouse);
  };

  const handleNext = () => setStep(4);
  const handleBack = () => setStep(2);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Warehouse Details</h2>
        <p className="text-muted-foreground">Add your storage facilities and warehouses.</p>
      </div>

      <div className="space-y-4">
        {warehouses.map((w) => (
          <Card key={w.id}>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{w.name || "Unnamed Warehouse"}</p>
                <p className="text-sm text-muted-foreground">{w.city || "No city"}, {w.state || "No state"}</p>
              </div>
              <Button variant="danger" size="sm" onClick={() => removeWarehouse(w.id)}>
                Remove
              </Button>
            </CardContent>
          </Card>
        ))}
        <Button variant="outline" className="w-full" onClick={handleAddWarehouse}>
          + Add Warehouse
        </Button>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack}>Back</Button>
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
