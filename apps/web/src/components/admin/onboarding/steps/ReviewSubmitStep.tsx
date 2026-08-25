"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ReviewSubmitStepProps {
  onBack: () => void;
}

export function ReviewSubmitStep({ onBack }: ReviewSubmitStepProps) {
  const router = useRouter();
  const state = useAdminOnboardingStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        profile: {
          fullName: state.fullName,
          employeeId: state.employeeId,
          designation: state.designation,
          department: state.department,
          officialEmail: state.officialEmail,
          phone: state.phone,
        },
        security: {
          mfaMethod: state.mfaMethod,
          recoveryEmail: state.recoveryEmail,
          recoveryMobile: state.recoveryMobile,
          sessionTimeoutMinutes: state.sessionTimeoutMinutes,
          rememberBrowser: state.rememberBrowser,
        },
        preferences: {
          theme: state.theme,
          dashboardLayout: state.dashboardLayout,
          defaultLandingPage: state.defaultLandingPage,
        },
        notifications: {
          newUserRegistrations: state.newUserRegistrations,
          reportedContent: state.reportedContent,
          failedVerifications: state.failedVerifications,
          securityEvents: state.securityEvents,
          platformErrors: state.platformErrors,
          serverHealth: state.serverHealth,
          schemeUpdates: state.schemeUpdates,
          systemAnnouncements: state.systemAnnouncements,
        },
      };

      const res = await fetch("/api/v1/admin/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to complete onboarding. Please try again.");
      }

      state.resetOnboarding();
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Review your details</h3>
        <p className="text-sm text-gray-500">
          Please review the details below before completing the setup.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-transparent shadow-none border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-sm">Profile Details</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><span className="font-medium">Name:</span> {state.fullName}</li>
                <li><span className="font-medium">Email:</span> {state.officialEmail}</li>
                <li><span className="font-medium">Emp ID:</span> {state.employeeId}</li>
                <li><span className="font-medium">Dept:</span> {state.department}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-transparent shadow-none border-gray-200 dark:border-gray-800">
            <CardContent className="p-4 space-y-2">
              <h4 className="font-semibold text-sm">Security & Preferences</h4>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><span className="font-medium">MFA:</span> {state.mfaMethod}</li>
                <li><span className="font-medium">Theme:</span> {state.theme}</li>
                <li><span className="font-medium">Layout:</span> {state.dashboardLayout}</li>
                <li><span className="font-medium">Landing Page:</span> {state.defaultLandingPage}</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-center space-x-2 text-sm">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="flex justify-between pt-4 border-t border-gray-100 dark:border-gray-800">
        <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? (
            <span className="flex items-center space-x-2">
              <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              <span>Submitting...</span>
            </span>
          ) : (
            <span className="flex items-center space-x-2">
              <span>Complete Setup</span>
              <CheckCircle2 className="w-4 h-4" />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}
