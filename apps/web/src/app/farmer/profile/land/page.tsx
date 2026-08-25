"use client";

import React, { useState, useEffect } from "react";
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
import { Loader2, Plus, Map as MapIcon, Trash2, Undo } from "lucide-react";
import {
  Dialog,
} from "@/components/ui/Dialog";

import dynamic from 'next/dynamic';



const PolygonPicker = dynamic(() => import("@/components/PolygonPicker"), { ssr: false });

const parcelSchema = z.object({
  farmId: z.string().min(1, "Farm is required"),
  parcelName: z.string().min(2, "Parcel name is required"),
  parcelId: z.string().optional(),
  area: z.coerce.number().min(0.01),
  soilType: z.string().optional(),
  waterSource: z.string().optional(),
  currentCrop: z.string().optional(),
});

type ParcelFormValues = z.infer<typeof parcelSchema>;



export default function LandParcelsPage() {
  const { farms, fetchFarms } = useFarmerProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [polygonPoints, setPolygonPoints] = useState<any[]>([]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ParcelFormValues>({
    resolver: zodResolver(parcelSchema),
  });

  const onSubmit = async (data: ParcelFormValues) => {
    setIsAdding(true);
    try {
      const payload = {
        ...data,
        gpsCoordinates: polygonPoints.length >= 3 ? polygonPoints : null,
      };
      
      const res = await api.post(`/farmer/farms/${data.farmId}/parcels`, payload);
      if (res.data?.success) {
        toast.success("Land parcel added");
        setIsDialogOpen(false);
        reset();
        setPolygonPoints([]);
        await fetchFarms(); // re-fetch to get updated parcels
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add parcel");
    } finally {
      setIsAdding(false);
    }
  };

  const undoLastPoint = () => {
    setPolygonPoints(prev => prev.slice(0, -1));
  };

  const clearPoints = () => {
    setPolygonPoints([]);
  };

  // Extract all parcels from farms
  const allParcels = farms.flatMap(f => (f.landParcels || []).map((p: any) => ({ ...p, farmName: f.name })));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Land Parcels</h2>
          <p className="text-muted-foreground">Map and manage specific plots of land.</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Parcel
        </Button>
        <Dialog isOpen={isDialogOpen} onClose={() => {
          setIsDialogOpen(false);
          setPolygonPoints([]);
        }} title="Add Land Parcel">
          
            
              
              <p className="text-sm text-muted-foreground mb-4">Map the boundaries of your land and add details.</p>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4 flex-1 flex flex-col">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="farmId">Select Farm</Label>
                  <select 
                    id="farmId" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("farmId")}
                  >
                    <option value="">Select a farm</option>
                    {farms.map((f: any) => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                  {errors.farmId && <p className="text-sm text-red-500">{errors.farmId.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="parcelName">Parcel Name (e.g. North Field)</Label>
                  <Input id="parcelName" {...register("parcelName")} />
                  {errors.parcelName && <p className="text-sm text-red-500">{errors.parcelName.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="area">Area (in Farm's Unit)</Label>
                  <Input id="area" type="number" step="0.01" {...register("area")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currentCrop">Current Crop</Label>
                  <Input id="currentCrop" {...register("currentCrop")} />
                </div>
              </div>

              <div className="space-y-2 flex-1 flex flex-col min-h-[300px]">
                <div className="flex justify-between items-center">
                  <Label>Draw Parcel Boundary</Label>
                  <div className="space-x-2">
                    <Button type="button" variant="outline" size="sm" onClick={undoLastPoint} disabled={polygonPoints.length === 0}>
                      <Undo className="w-4 h-4 mr-2" /> Undo Point
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={clearPoints} disabled={polygonPoints.length === 0}>
                      Clear
                    </Button>
                  </div>
                </div>
                <div className="flex-1 rounded-lg border overflow-hidden">
                  <PolygonPicker points={polygonPoints} setPoints={setPolygonPoints} />
                </div>
                <p className="text-xs text-muted-foreground text-center">Click on the map to add points to the boundary polygon.</p>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Parcel
                </Button>
              </div>
            </form>
          
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allParcels.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-muted/50 rounded-xl border border-dashed">
            <MapIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Parcels Found</h3>
            <p className="text-muted-foreground">You haven't mapped any land parcels yet.</p>
          </div>
        ) : (
          allParcels.map((parcel: any) => (
            <Card key={parcel.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{parcel.parcelName}</CardTitle>
                <CardDescription>Part of {parcel.farmName}</CardDescription>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Area</div>
                  <div className="font-medium text-right">{parcel.area}</div>
                  
                  <div className="text-muted-foreground">Current Crop</div>
                  <div className="font-medium text-right">{parcel.currentCrop || 'N/A'}</div>
                  
                  <div className="text-muted-foreground">Coordinates</div>
                  <div className="font-medium text-right text-emerald-600">
                    {parcel.gpsCoordinates ? 'Mapped' : 'Unmapped'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
