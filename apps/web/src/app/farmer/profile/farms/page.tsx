"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import api from "@/lib/api";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { Loader2, Plus, Tractor, Trash2 } from "lucide-react";
import {
  Dialog,
} from "@/components/ui/Dialog";
import { Badge } from "@/components/ui/Badge";

const farmSchema = z.object({
  name: z.string().min(2, "Farm name is required"),
  farmCode: z.string().optional(),
  farmType: z.string().optional(),
  totalArea: z.coerce.number().min(0.1, "Total area must be > 0.1"),
  areaUnit: z.string().min(1, "Area unit is required"),
  ownershipType: z.string().optional(),
  primaryCrop: z.string().optional(),
  irrigationMethod: z.string().optional(),
});

type FarmFormValues = z.infer<typeof farmSchema>;

export default function FarmsPage() {
  const { farms, fetchFarms } = useFarmerProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FarmFormValues>({
    resolver: zodResolver(farmSchema),
    defaultValues: {
      areaUnit: "Acres",
    }
  });

  const onSubmit = async (data: FarmFormValues) => {
    setIsAdding(true);
    try {
      const res = await api.post("/farmer/farms", data);
      if (res.data?.success) {
        toast.success("Farm added successfully");
        setIsDialogOpen(false);
        reset();
        await fetchFarms();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add farm");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteFarm = async (id: string) => {
    if (!confirm("Are you sure you want to remove this farm?")) return;
    try {
      const res = await api.delete(`/farmer/farms/${id}`);
      if (res.data?.success) {
        toast.success("Farm removed");
        await fetchFarms();
      }
    } catch (err) {
      toast.error("Failed to remove farm");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Farm Management</h2>
          <p className="text-muted-foreground">Manage your registered farms and properties.</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Farm
        </Button>
        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Register New Farm">


            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Farm Name</Label>
                  <Input id="name" {...register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="farmCode">Farm Code / ID (Optional)</Label>
                  <Input id="farmCode" {...register("farmCode")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="totalArea">Total Area</Label>
                  <Input id="totalArea" type="number" step="0.01" {...register("totalArea")} />
                  {errors.totalArea && <p className="text-sm text-red-500">{errors.totalArea.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="areaUnit">Area Unit</Label>
                  <select 
                    id="areaUnit" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("areaUnit")}
                  >
                    <option value="Acres">Acres</option>
                    <option value="Hectares">Hectares</option>
                    <option value="Sq Meters">Sq Meters</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ownershipType">Ownership Type</Label>
                  <select 
                    id="ownershipType" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("ownershipType")}
                  >
                    <option value="Owned">Owned</option>
                    <option value="Leased">Leased</option>
                    <option value="Contract">Contract</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryCrop">Primary Crop</Label>
                  <Input id="primaryCrop" {...register("primaryCrop")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="irrigationMethod">Irrigation Method</Label>
                  <select 
                    id="irrigationMethod" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...register("irrigationMethod")}
                  >
                    <option value="Drip">Drip</option>
                    <option value="Sprinkler">Sprinkler</option>
                    <option value="Flood">Flood</option>
                    <option value="Rainfed">Rainfed</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Farm
                </Button>
              </div>
            </form>
          
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {farms.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-muted/50 rounded-xl border border-dashed">
            <Tractor className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Farms Found</h3>
            <p className="text-muted-foreground">You haven't registered any farms yet.</p>
          </div>
        ) : (
          farms.map((farm: any) => (
            <Card key={farm.id}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{farm.name}</CardTitle>
                    <CardDescription>{farm.farmCode || 'No code provided'}</CardDescription>
                  </div>
                  <Badge variant="secondary">{farm.verificationStatus}</Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Area</div>
                  <div className="font-medium text-right">{farm.totalArea} {farm.areaUnit || 'Acres'}</div>
                  
                  <div className="text-muted-foreground">Primary Crop</div>
                  <div className="font-medium text-right">{farm.primaryCrop || 'N/A'}</div>
                  
                  <div className="text-muted-foreground">Irrigation</div>
                  <div className="font-medium text-right">{farm.irrigationMethod || 'N/A'}</div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t flex justify-end">
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => deleteFarm(farm.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Remove
                </Button>
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
