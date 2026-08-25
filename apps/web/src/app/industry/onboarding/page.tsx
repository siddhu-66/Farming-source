import { Metadata } from "next";
import IndustryOnboardingWizard from "@/components/industry/onboarding/IndustryOnboardingWizard";

export const metadata: Metadata = {
  title: "Industry Onboarding | AgriAssist",
  description: "Set up your industry profile to start procuring raw materials directly from farmers.",
};

export default function IndustryOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-4xl w-full">
        <IndustryOnboardingWizard />
      </div>
    </div>
  );
}
