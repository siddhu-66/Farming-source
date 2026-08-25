"use client";

import React from "react";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";

interface NotificationsStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function NotificationsStep({ onNext, onBack }: NotificationsStepProps) {
  const {
    newUserRegistrations,
    reportedContent,
    failedVerifications,
    securityEvents,
    platformErrors,
    serverHealth,
    schemeUpdates,
    systemAnnouncements,
    updateField,
  } = useAdminOnboardingStore();

  const toggleItems = [
    { id: "newUserRegistrations", label: "New User Registrations", value: newUserRegistrations },
    { id: "reportedContent", label: "Reported Content", value: reportedContent },
    { id: "failedVerifications", label: "Failed KYC Verifications", value: failedVerifications },
    { id: "securityEvents", label: "Security Events (Logins, MFA)", value: securityEvents },
    { id: "platformErrors", label: "Platform Errors (API, UI)", value: platformErrors },
    { id: "serverHealth", label: "Server Health & Downtime", value: serverHealth },
    { id: "schemeUpdates", label: "Government Scheme Updates", value: schemeUpdates },
    { id: "systemAnnouncements", label: "System Announcements", value: systemAnnouncements },
  ] as const;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-sm text-gray-500 mb-4">
          Configure which system events you want to be notified about via email or push notifications.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {toggleItems.map((item) => (
          <div key={item.id} className="flex items-center space-x-3">
            <Switch
              id={item.id}
              checked={item.value}
              onCheckedChange={(checked) => updateField(item.id, checked)}
            />
            <Label htmlFor={item.id} className="cursor-pointer text-sm font-medium">
              {item.label}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-8">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </div>
  );
}
