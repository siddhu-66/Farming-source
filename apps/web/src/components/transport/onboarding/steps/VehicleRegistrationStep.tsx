"use client";

import { useTransportOnboardingStore, TransportVehicle } from "@/stores/transportOnboardingStore";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";
import { useState } from "react";

export function VehicleRegistrationStep() {
  const store = useTransportOnboardingStore();
  const [newVehicle, setNewVehicle] = useState<Partial<TransportVehicle>>({
    vehicleNumber: "",
    vehicleType: "",
    brand: "",
    model: "",
  });

  const handleAdd = () => {
    if (newVehicle.vehicleNumber) {
      store.addVehicle({
        id: Math.random().toString(36).substr(2, 9),
        vehicleNumber: newVehicle.vehicleNumber || "",
        vehicleType: newVehicle.vehicleType || "",
        brand: newVehicle.brand || "",
        model: newVehicle.model || "",
        manufacturingYear: "",
        loadCapacity: "",
        capacityUnit: "kg",
        fuelType: "diesel",
        isPrimary: store.vehicles.length === 0,
      });
      setNewVehicle({ vehicleNumber: "", vehicleType: "", brand: "", model: "" });
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Vehicle Registration</h2>
      
      <div className="flex-grow space-y-6">
        <div className="border p-4 rounded-lg space-y-4 bg-gray-50">
          <h3 className="font-medium">Add a Vehicle</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Vehicle Number</Label>
              <Input 
                value={newVehicle.vehicleNumber} 
                onChange={(e) => setNewVehicle({...newVehicle, vehicleNumber: e.target.value})}
                placeholder="e.g. MH12AB1234"
              />
            </div>
            <div className="space-y-2">
              <Label>Vehicle Type</Label>
              <Input 
                value={newVehicle.vehicleType} 
                onChange={(e) => setNewVehicle({...newVehicle, vehicleType: e.target.value})}
                placeholder="e.g. Truck, Tractor"
              />
            </div>
          </div>
          <Button onClick={handleAdd}>Add Vehicle</Button>
        </div>

        {store.vehicles.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Registered Vehicles</h3>
            {store.vehicles.map(v => (
              <div key={v.id} className="flex justify-between items-center p-3 border rounded">
                <div>
                  <p className="font-semibold">{v.vehicleNumber}</p>
                  <p className="text-sm text-gray-600">{v.vehicleType}</p>
                </div>
                <Button variant="danger" size="sm" onClick={() => store.removeVehicle(v.id)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(2)}>Back</Button>
        <Button onClick={() => store.setStep(4)}>Next Step</Button>
      </div>
    </div>
  );
}
