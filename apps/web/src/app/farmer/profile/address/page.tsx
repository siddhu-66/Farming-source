"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Loader2, MapPin } from "lucide-react";

// Dynamically import Leaflet components to avoid SSR issues
import dynamic from 'next/dynamic';



const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

const addressSchema = z.object({
  houseNumber: z.string().optional(),
  village: z.string().min(2, "Village/City is required"),
  mandal: z.string().optional(),
  district: z.string().min(2, "District is required"),
  state: z.string().min(2, "State is required"),
  pincode: z.string().min(6, "Valid pincode is required"),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

type AddressFormValues = z.infer<typeof addressSchema>;



export default function AddressInfoPage() {
  const { profile, isSaving, updateProfile } = useFarmerProfileStore();
  const [position, setPosition] = useState<any>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<AddressFormValues>({
    resolver: zodResolver(addressSchema),
  });

  useEffect(() => {
    if (profile?.addresses && profile.addresses.length > 0) {
      const addr = profile.addresses[0];
      reset({
        houseNumber: addr.houseNumber || "",
        village: addr.village || "",
        mandal: addr.mandal || "",
        district: addr.district || "",
        state: addr.state || "",
        pincode: addr.pincode || "",
        latitude: addr.latitude || undefined,
        longitude: addr.longitude || undefined,
      });
      if (addr.latitude && addr.longitude) {
        setPosition({ lat: addr.latitude, lng: addr.longitude });
      }
    }
  }, [profile, reset]);

  useEffect(() => {
    if (position) {
      setValue("latitude", position.lat);
      setValue("longitude", position.lng);
    }
  }, [position, setValue]);

  const onSubmit = async (data: AddressFormValues) => {
    // We send address as part of profile update. Backend handles it.
    await updateProfile({ address: data });
  };

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      });
    }
  };

  // Default to India center if no position
  const center = position || { lat: 20.5937, lng: 78.9629 };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Address & Location</CardTitle>
        <CardDescription>Your residential or primary farm address.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="houseNumber">House / Door Number</Label>
              <Input id="houseNumber" {...register("houseNumber")} />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="village">Village / City</Label>
              <Input id="village" {...register("village")} />
              {errors.village && <p className="text-sm text-red-500">{errors.village.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="mandal">Mandal / Tehsil</Label>
              <Input id="mandal" {...register("mandal")} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="district">District</Label>
              <Input id="district" {...register("district")} />
              {errors.district && <p className="text-sm text-red-500">{errors.district.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" {...register("state")} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode</Label>
              <Input id="pincode" {...register("pincode")} />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Pin Location on Map</Label>
              <Button type="button" variant="outline" size="sm" onClick={handleGetCurrentLocation}>
                <MapPin className="w-4 h-4 mr-2" /> Use Current Location
              </Button>
            </div>
            <div className="h-[300px] rounded-lg overflow-hidden border">
              <LocationPicker position={position} setPosition={setPosition} />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Address
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
