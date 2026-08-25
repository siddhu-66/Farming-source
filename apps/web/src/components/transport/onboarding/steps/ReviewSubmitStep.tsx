"use client";

import { useTransportOnboardingStore } from "@/stores/transportOnboardingStore";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function ReviewSubmitStep() {
  const store = useTransportOnboardingStore();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/v1/transport/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });

      if (!response.ok) {
        throw new Error("Failed to submit onboarding data");
      }

      store.resetOnboarding();
      router.push("/transport/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 flex flex-col h-full">
      <h2 className="text-xl font-semibold">Review & Submit</h2>
      
      <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm flex-grow">
        <p><strong>Company:</strong> {store.companyName || "Not provided"}</p>
        <p><strong>Driver:</strong> {store.driverName || "Not provided"}</p>
        <p><strong>Vehicles:</strong> {store.vehicles.length} registered</p>
        <p><strong>Bank:</strong> {store.bankName || "Not provided"} ({store.accountNumber || "N/A"})</p>
        <p><strong>Pricing:</strong> {store.basePrice ? `₹${store.basePrice} Base` : "Not provided"} / {store.pricePerKm ? `₹${store.pricePerKm} per km` : "N/A"}</p>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-between mt-6 pt-4 border-t">
        <Button variant="outline" onClick={() => store.setStep(7)} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Registration"}
        </Button>
      </div>
    </div>
  );
}
