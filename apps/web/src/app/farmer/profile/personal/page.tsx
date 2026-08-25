"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Loader2 } from "lucide-react";

const personalSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z.string().optional(),
  gender: z.string().optional(),
  aadhaarNumber: z.string().optional(),
  panNumber: z.string().optional(),
  occupation: z.string().optional(),
  education: z.string().optional(),
});

type PersonalFormValues = z.infer<typeof personalSchema>;

export default function PersonalInfoPage() {
  const { profile, isSaving, updateProfile } = useFarmerProfileStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PersonalFormValues>({
    resolver: zodResolver(personalSchema),
  });

  useEffect(() => {
    if (profile) {
      const names = (profile.fullName || "").split(" ");
      reset({
        firstName: names[0] || "",
        lastName: names.slice(1).join(" ") || "",
        dateOfBirth: profile.dateOfBirth || "",
        gender: profile.gender || "",
        aadhaarNumber: profile.aadhaarNumber || "",
        panNumber: profile.panNumber || "",
        occupation: profile.occupation || "Farmer",
        education: profile.education || "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: PersonalFormValues) => {
    await updateProfile(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
        <CardDescription>Update your personal identity details and KYC information.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input id="firstName" {...register("firstName")} />
              {errors.firstName && <p className="text-sm text-red-500">{errors.firstName.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input id="lastName" {...register("lastName")} />
              {errors.lastName && <p className="text-sm text-red-500">{errors.lastName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth</Label>
              <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select 
                id="gender" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("gender")}
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="aadhaarNumber">Aadhaar Number (UIDAI)</Label>
              <Input id="aadhaarNumber" placeholder="XXXX XXXX XXXX" {...register("aadhaarNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="panNumber">PAN Number</Label>
              <Input id="panNumber" placeholder="ABCDE1234F" className="uppercase" {...register("panNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="occupation">Primary Occupation</Label>
              <Input id="occupation" {...register("occupation")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="education">Education Level</Label>
              <select 
                id="education" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("education")}
              >
                <option value="">Select Education</option>
                <option value="None">None</option>
                <option value="Primary">Primary School</option>
                <option value="High School">High School</option>
                <option value="Graduate">Graduate</option>
                <option value="Post Graduate">Post Graduate</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
