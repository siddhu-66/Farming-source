"use client";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";

export default function WarehouseSetupStep() {
  const { warehouses, addWarehouse, removeWarehouse, setStep, currentStep } = useIndustryOnboardingStore();

  const handleAdd = () => {
    addWarehouse({
      id: Math.random().toString(36).substr(2, 9),
      warehouseName: "New Warehouse",
      address: "",
      capacityTons: 100,
      coldStorage: false,
      temperatureControlled: false,
      latitude: null,
      longitude: null,
      isDefault: warehouses.length === 0,
    });
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">Warehouse Setup</h3>
          <Button variant="outline" onClick={handleAdd}>Add Warehouse</Button>
        </div>
        
        {warehouses.length === 0 ? (
          <p className="text-gray-500">No warehouses added yet.</p>
        ) : (
          <div className="space-y-4">
            {warehouses.map(w => (
              <div key={w.id} className="p-4 border rounded-xl flex justify-between items-center bg-white shadow-sm">
                <div>
                  <h4 className="font-medium">{w.warehouseName}</h4>
                  <p className="text-sm text-gray-500">Capacity: {w.capacityTons} Tons</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => removeWarehouse(w.id)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => setStep(currentStep - 1)}>Back</Button>
        <Button onClick={() => setStep(currentStep + 1)}>Next Step</Button>
      </div>
    </div>
  );
}
