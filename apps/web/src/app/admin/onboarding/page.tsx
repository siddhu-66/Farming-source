import React from "react";
import { AdminOnboardingWizard } from "@/components/admin/onboarding/AdminOnboardingWizard";

// Optional: You could wrap this in an AuthGuard or RoleGuard to ensure only users with the Admin role can access it.
export default function AdminOnboardingPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-12 flex flex-col justify-center">
      <AdminOnboardingWizard />
    </div>
  );
}
