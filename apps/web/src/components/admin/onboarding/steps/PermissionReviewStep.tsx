"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { Card, CardContent } from "@/components/ui/Card";
import { CheckCircle2 } from "lucide-react";

interface PermissionReviewStepProps {
  onNext: () => void;
  onBack: () => void;
}

export function PermissionReviewStep({ onNext, onBack }: PermissionReviewStepProps) {
  const [acknowledged, setAcknowledged] = useState(false);

  const permissions = [
    { name: "User Management", description: "View, approve, and suspend user accounts." },
    { name: "Buyer Management", description: "Manage corporate and individual buyer limits." },
    { name: "Content Moderation", description: "Review and remove inappropriate listings." },
    { name: "System Settings", description: "Manage global configuration and platform rules." },
    { name: "Financial Oversight", description: "View transaction summaries and fee structures." },
  ];

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-500 mb-4">
          Based on your designation, you have been assigned the following administrative permissions. 
          Please review them. You can request changes from your Super Admin later.
        </p>

        <div className="space-y-3">
          {permissions.map((perm, idx) => (
            <Card key={idx} className="bg-transparent shadow-none border-gray-200 dark:border-gray-800">
              <CardContent className="p-4 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-foreground">{perm.name}</h4>
                  <p className="text-xs text-gray-500">{perm.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-start space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Checkbox
          id="acknowledgePermissions"
          checked={acknowledged}
          onCheckedChange={(checked) => setAcknowledged(checked as boolean)}
          className="mt-1"
        />
        <Label
          htmlFor="acknowledgePermissions"
          className="text-sm font-medium cursor-pointer leading-tight text-foreground"
        >
          I acknowledge that I understand my responsibilities and the scope of my administrative permissions on the AgriAssist platform.
        </Label>
      </div>

      <div className="flex justify-between pt-4">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={!acknowledged}>
          Next Step
        </Button>
      </div>
    </div>
  );
}
