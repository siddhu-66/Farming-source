"use client";

import React from "react";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";

interface SecurityConfigStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function SecurityConfigStep({ onNext, onBack }: SecurityConfigStepProps) {
  const {
    mfaMethod,
    recoveryEmail,
    recoveryMobile,
    sessionTimeoutMinutes,
    rememberBrowser,
    updateField,
  } = useAdminOnboardingStore();

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label>Multi-Factor Authentication (MFA) Method</Label>
          <Select
            value={mfaMethod}
            onChange={(e) => updateField("mfaMethod", e.target.value)}
            options={[
              { value: "NONE", label: "None (Not Recommended)" },
              { value: "APP", label: "Authenticator App (TOTP)" },
              { value: "SMS", label: "SMS Authentication" },
              { value: "EMAIL", label: "Email Authentication" },
            ]}
          />
          <p className="text-xs text-gray-500 mt-1">
            MFA provides an additional layer of security for your admin account.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="recoveryEmail">Recovery Email</Label>
            <Input
              id="recoveryEmail"
              type="email"
              placeholder="backup@example.com"
              value={recoveryEmail}
              onChange={(e) => updateField("recoveryEmail", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="recoveryMobile">Recovery Mobile</Label>
            <Input
              id="recoveryMobile"
              placeholder="+1 234 567 8900"
              value={recoveryMobile}
              onChange={(e) => updateField("recoveryMobile", e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Session Timeout (Minutes)</Label>
          <Select
            value={sessionTimeoutMinutes.toString()}
            onChange={(e) => updateField("sessionTimeoutMinutes", parseInt(e.target.value, 10))}
            options={[
              { value: "15", label: "15 Minutes" },
              { value: "30", label: "30 Minutes" },
              { value: "60", label: "1 Hour" },
              { value: "120", label: "2 Hours" },
            ]}
          />
        </div>

        <div className="flex items-center space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <Switch
            checked={rememberBrowser}
            onCheckedChange={(checked) => updateField("rememberBrowser", checked)}
            id="rememberBrowser"
          />
          <div className="space-y-1">
            <Label htmlFor="rememberBrowser" className="font-medium cursor-pointer">
              Remember this browser
            </Label>
            <p className="text-sm text-gray-500">
              Skip MFA challenges on this specific browser for 30 days.
            </p>
          </div>
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
