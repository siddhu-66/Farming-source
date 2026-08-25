"use client";

import React, { useState } from "react";
import { useAdminOnboardingStore } from "@/stores/adminOnboardingStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

interface AdminProfileStepProps {
  onNext: () => void;
}

export function AdminProfileStep({ onNext }: AdminProfileStepProps) {
  const {
    fullName,
    employeeId,
    designation,
    department,
    officialEmail,
    phone,
    updateField,
  } = useAdminOnboardingStore();

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleNext = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName) newErrors.fullName = "Full name is required";
    if (!employeeId) newErrors.employeeId = "Employee ID is required";
    if (!officialEmail) newErrors.officialEmail = "Official email is required";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onNext();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              placeholder="e.g. Jane Doe"
              value={fullName}
              onChange={(e) => updateField("fullName", e.target.value)}
              error={errors.fullName}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="employeeId">Employee ID</Label>
            <Input
              id="employeeId"
              placeholder="e.g. ADM-001"
              value={employeeId}
              onChange={(e) => updateField("employeeId", e.target.value)}
              error={errors.employeeId}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="designation">Designation</Label>
            <Input
              id="designation"
              placeholder="e.g. System Administrator"
              value={designation}
              onChange={(e) => updateField("designation", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            <Input
              id="department"
              placeholder="e.g. IT Security"
              value={department}
              onChange={(e) => updateField("department", e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="officialEmail">Official Email</Label>
            <Input
              id="officialEmail"
              type="email"
              placeholder="admin@agriassist.com"
              value={officialEmail}
              onChange={(e) => updateField("officialEmail", e.target.value)}
              error={errors.officialEmail}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Mobile Number</Label>
            <Input
              id="phone"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => updateField("phone", e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleNext}>Next Step</Button>
      </div>
    </div>
  );
}
