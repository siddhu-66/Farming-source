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

const contactSchema = z.object({
  phone: z.string().min(10, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  emergencyContactName: z.string().optional(),
  emergencyContactNumber: z.string().optional(),
  preferredLanguage: z.string().optional(),
});

type ContactFormValues = z.infer<typeof contactSchema>;

export default function ContactInfoPage() {
  const { profile, isSaving, updateProfile } = useFarmerProfileStore();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
  });

  useEffect(() => {
    if (profile) {
      reset({
        phone: profile.phone || "",
        email: profile.email || "",
        emergencyContactName: profile.emergencyContactName || "",
        emergencyContactNumber: profile.emergencyContactNumber || "",
        preferredLanguage: profile.language || "English",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: ContactFormValues) => {
    await updateProfile(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contact Details</CardTitle>
        <CardDescription>How buyers and the AgriAssist platform can reach you.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number</Label>
              <Input id="phone" placeholder="+91 XXXXX XXXXX" {...register("phone")} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" placeholder="farmer@example.com" {...register("email")} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
              <Input id="emergencyContactName" {...register("emergencyContactName")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactNumber">Emergency Contact Number</Label>
              <Input id="emergencyContactNumber" {...register("emergencyContactNumber")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredLanguage">Preferred Language</Label>
              <select 
                id="preferredLanguage" 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...register("preferredLanguage")}
              >
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Telugu">Telugu</option>
                <option value="Marathi">Marathi</option>
                <option value="Tamil">Tamil</option>
                <option value="Gujarati">Gujarati</option>
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
