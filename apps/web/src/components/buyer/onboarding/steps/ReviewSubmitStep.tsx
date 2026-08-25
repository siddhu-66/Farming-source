"use client";

import { useBuyerOnboardingStore } from "@/stores/buyerOnboardingStore";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReviewSubmitStep() {
  const store = useBuyerOnboardingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/buyer/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(store),
      });

      if (!response.ok) {
        throw new Error("Failed to submit onboarding data");
      }

      store.resetOnboarding();
      router.push("/buyer/dashboard");
    } catch (error) {
      console.error(error);
      // Handle error (e.g., show a toast)
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => store.setStep(6);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Review & Submit</h2>
        <p className="text-muted-foreground">Review your information before submitting.</p>
      </div>

      <div className="space-y-4 bg-muted/50 p-4 rounded-lg">
        <div>
          <h3 className="font-semibold">Business Name</h3>
          <p>{store.businessName || "Not provided"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Owner Name</h3>
          <p>{store.ownerName || "Not provided"}</p>
        </div>
        <div>
          <h3 className="font-semibold">Contact Email</h3>
          <p>{store.email || "Not provided"}</p>
        </div>
        <div>
          <h3 className="font-semibold">GST Number</h3>
          <p>{store.gstNumber || "Not provided"}</p>
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={handleBack} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Application"}
        </Button>
      </div>
    </div>
  );
}
