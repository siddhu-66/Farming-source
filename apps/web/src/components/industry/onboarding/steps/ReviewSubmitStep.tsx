"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useIndustryOnboardingStore } from "@/stores/industryOnboardingStore";
import { Button } from "@/components/ui/Button";

export default function ReviewSubmitStep() {
  const state = useIndustryOnboardingStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/v1/industry/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(state),
      });

      if (!res.ok) {
        throw new Error("Failed to submit onboarding data");
      }

      state.resetOnboarding();
      router.push("/industry/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex-grow space-y-4">
        <h3 className="text-xl font-semibold">Review & Submit</h3>
        <p className="text-gray-600">Please review your information before submitting.</p>
        
        <div className="bg-gray-50 p-4 rounded-xl border space-y-4 h-[300px] overflow-y-auto">
          <div>
            <h4 className="font-medium text-green-700">Company Information</h4>
            <p className="text-sm">Name: {state.companyName || "N/A"}</p>
            <p className="text-sm">Type: {state.industryType || "N/A"}</p>
          </div>
          <div>
            <h4 className="font-medium text-green-700">Factory Information</h4>
            <p className="text-sm">Name: {state.factoryName || "N/A"}</p>
            <p className="text-sm">Location: {state.city || "N/A"}, {state.state || "N/A"}</p>
          </div>
          <div>
            <h4 className="font-medium text-green-700">Warehouses</h4>
            <p className="text-sm">Total Warehouses: {state.warehouses.length}</p>
          </div>
          <div>
            <h4 className="font-medium text-green-700">Banking</h4>
            <p className="text-sm">Bank: {state.bankName || "N/A"}</p>
          </div>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={() => state.setStep(state.currentStep - 1)} disabled={loading}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Submitting..." : "Submit Registration"}
        </Button>
      </div>
    </div>
  );
}
