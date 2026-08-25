"use client";

import { TransportOnboardingWizard } from "@/components/transport/onboarding/TransportOnboardingWizard";

export default function TransportOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <TransportOnboardingWizard />
      </div>
    </div>
  );
}
