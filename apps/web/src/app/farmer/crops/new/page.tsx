"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCropStore } from "@/stores/useCropStore";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";

const cropSchema = z.object({
  cropName: z.string().min(2, "Crop name is required"),
  category: z.string().min(2, "Category is required"),
  variety: z.string().min(2, "Variety is required"),
  farmId: z.string().min(1, "Farm is required"),
  parcelId: z.string().min(1, "Land Parcel is required"),
  area: z.coerce.number().min(0.1, "Area must be greater than 0"),
  seedSource: z.string().optional(),
  seedQuantity: z.coerce.number().optional(),
  sowingDate: z.string().min(1, "Sowing date is required"),
  expectedHarvestDate: z.string().min(1, "Expected harvest date is required"),
  season: z.string().min(1, "Season is required"),
  soilType: z.string().optional(),
  irrigationMethod: z.string().optional(),
});

type CropFormValues = z.infer<typeof cropSchema>;

const CATEGORIES = [
  "Cereals", "Pulses", "Oil Seeds", "Vegetables", "Fruits", "Spices", 
  "Plantation Crops", "Medicinal Plants", "Flowers", "Fodder Crops"
];

const SEASONS = ["Kharif (Monsoon)", "Rabi (Winter)", "Zaid (Summer)", "Perennial"];

export default function RegisterCropPage() {
  const router = useRouter();
  const { registerCrop, isSaving } = useCropStore();
  const { farms, fetchFarms } = useFarmerProfileStore();
  
  const [selectedFarm, setSelectedFarm] = useState<string>("");

  useEffect(() => {
    fetchFarms();
  }, [fetchFarms]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<CropFormValues>({
    resolver: zodResolver(cropSchema),
    defaultValues: {
      sowingDate: new Date().toISOString().split('T')[0]
    }
  });

  const watchFarmId = watch("farmId");
  useEffect(() => {
    setSelectedFarm(watchFarmId);
  }, [watchFarmId]);

  const activeFarm = farms.find(f => f.id === selectedFarm);
  const availableParcels = activeFarm?.landParcels || [];

  const onSubmit = async (data: CropFormValues) => {
    try {
      await registerCrop(data);
      router.push('/farmer/crops');
    } catch (error) {
      // toast is handled in store
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/farmer/crops">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Register New Crop</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Crop Information</CardTitle>
          <CardDescription>Enter the details for the new crop you are planting.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="cropName">Crop Name *</Label>
                <Input id="cropName" placeholder="e.g. Cotton" {...register("cropName")} />
                {errors.cropName && <p className="text-sm text-red-500">{errors.cropName.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select 
                  id="category" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register("category")}
                >
                  <option value="">Select a category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                {errors.category && <p className="text-sm text-red-500">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="variety">Variety *</Label>
                <Input id="variety" placeholder="e.g. BT Cotton 2" {...register("variety")} />
                {errors.variety && <p className="text-sm text-red-500">{errors.variety.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="season">Season *</Label>
                <select 
                  id="season" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register("season")}
                >
                  <option value="">Select season</option>
                  {SEASONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.season && <p className="text-sm text-red-500">{errors.season.message}</p>}
              </div>
            </div>

            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="farmId">Farm *</Label>
                <select 
                  id="farmId" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register("farmId")}
                >
                  <option value="">Select Farm</option>
                  {farms.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                {errors.farmId && <p className="text-sm text-red-500">{errors.farmId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="parcelId">Land Parcel *</Label>
                <select 
                  id="parcelId" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:opacity-50"
                  {...register("parcelId")}
                  disabled={!selectedFarm}
                >
                  <option value="">{selectedFarm ? "Select Parcel" : "Select Farm first"}</option>
                  {availableParcels.map((p: any) => <option key={p.id} value={p.id}>{p.parcelName} ({p.area})</option>)}
                </select>
                {errors.parcelId && <p className="text-sm text-red-500">{errors.parcelId.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="area">Allocated Area *</Label>
                <Input id="area" type="number" step="0.1" placeholder="In acres/hectares" {...register("area")} />
                {errors.area && <p className="text-sm text-red-500">{errors.area.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                <select 
                  id="irrigationMethod" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  {...register("irrigationMethod")}
                >
                  <option value="">Select method</option>
                  <option value="Rainfed">Rainfed</option>
                  <option value="Drip">Drip Irrigation</option>
                  <option value="Sprinkler">Sprinkler</option>
                  <option value="Flood">Flood/Furrow</option>
                </select>
              </div>
            </div>

            <div className="border-t pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sowingDate">Sowing Date *</Label>
                <Input id="sowingDate" type="date" {...register("sowingDate")} />
                {errors.sowingDate && <p className="text-sm text-red-500">{errors.sowingDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="expectedHarvestDate">Expected Harvest Date *</Label>
                <Input id="expectedHarvestDate" type="date" {...register("expectedHarvestDate")} />
                {errors.expectedHarvestDate && <p className="text-sm text-red-500">{errors.expectedHarvestDate.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="seedSource">Seed Source</Label>
                <Input id="seedSource" placeholder="e.g. Local Market, Gov Agency" {...register("seedSource")} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="seedQuantity">Seed Quantity (Kg)</Label>
                <Input id="seedQuantity" type="number" step="0.1" {...register("seedQuantity")} />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isSaving} className="bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Register Crop
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
