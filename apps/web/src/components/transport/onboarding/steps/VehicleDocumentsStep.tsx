"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Label } from "@/components/ui/Label";
import { Button } from "@/components/ui/Button";

export function VehicleDocumentsStep() {
  const store = useTransportOnboardingStore();

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Vehicle Documents</h2>
      
      <div className="flex-grow space-y-4">
        {store.vehicles.length === 0 ? (
          <p className="text-gray-500">No vehicles registered yet. Go back and add a vehicle.</p>
        ) : (
          store.vehicles.map(v => (
            <div key={v.id} className="border p-4 rounded-lg space-y-4">
              <h3 className="font-medium">Documents for {v.vehicleNumber}</h3>
              {/* Mock upload fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>RC Book</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Upload RC</Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Insurance</Label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Upload Insurance</Button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(3)}>Back</Button>
        <Button onClick={() => store.setStep(5)}>Next Step</Button>
      </div>
    </div>
  );
}
