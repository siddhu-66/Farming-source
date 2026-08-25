"use client";

import React from "react";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Label } from "@/components/ui/Label";

interface WorkspacePreferencesStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function WorkspacePreferencesStep({ onNext, onBack }: WorkspacePreferencesStepProps) {
  const { theme, dashboardLayout, defaultLandingPage, updateField } = useAdminOnboardingStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Theme Preference</Label>
          <Select
            value={theme}
            onChange={(e) => updateField("theme", e.target.value)}
            options={[
              { value: "System", label: "System Default" },
              { value: "Light", label: "Light Mode" },
              { value: "Dark", label: "Dark Mode" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label>Dashboard Layout</Label>
          <Select
            value={dashboardLayout}
            onChange={(e) => updateField("dashboardLayout", e.target.value)}
            options={[
              { value: "Analytics Focus", label: "Analytics Focus (Metrics & Charts)" },
              { value: "Action Focus", label: "Action Focus (Tasks & Approvals)" },
              { value: "Compact", label: "Compact View (High Density)" },
            ]}
          />
        </div>

        <div className="space-y-2">
          <Label>Default Landing Page</Label>
          <Select
            value={defaultLandingPage}
            onChange={(e) => updateField("defaultLandingPage", e.target.value)}
            options={[
              { value: "Dashboard", label: "Main Dashboard" },
              { value: "UserManagement", label: "User Management" },
              { value: "Moderation", label: "Content Moderation Queue" },
              { value: "SystemHealth", label: "System Health & Logs" },
            ]}
          />
        </div>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </div>
  );
}
