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
import { Badge } from "@/components/ui/Badge";
import { Loader2, Plus, Tractor, Settings, Wrench, Trash2 } from "lucide-react";
import {
  Dialog,
} from "@/components/ui/Dialog";

const assetSchema = z.object({
  assetName: z.string().min(2, "Asset name is required"),
  assetType: z.string().min(1, "Asset type is required"),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.coerce.number().optional(),
  currentStatus: z.string().default('Active'),
});

type AssetFormValues = z.infer<typeof assetSchema>;

export default function AssetsPage() {
  const { assets, fetchAssets } = useFarmerProfileStore();
  const [isAdding, setIsAdding] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssetFormValues>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      currentStatus: 'Active',
    }
  });

  const onSubmit = async (data: AssetFormValues) => {
    setIsAdding(true);
    try {
      const res = await api.post("/farmer/assets", data);
      if (res.data?.success) {
        toast.success("Asset registered successfully");
        setIsDialogOpen(false);
        reset();
        await fetchAssets();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to add asset");
    } finally {
      setIsAdding(false);
    }
  };

  const deleteAsset = async (id: string) => {
    if (!confirm("Are you sure you want to remove this asset?")) return;
    try {
      const res = await api.delete(`/farmer/assets/${id}`);
      if (res.data?.success) {
        toast.success("Asset removed");
        await fetchAssets();
      }
    } catch (err) {
      toast.error("Failed to remove asset");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Farm Assets</h2>
          <p className="text-muted-foreground">Manage your equipment, machinery, and physical assets.</p>
        </div>
        
        <Button onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Add Asset
        </Button>

        <Dialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} title="Register New Asset">
          <p className="text-sm text-muted-foreground mb-4">Add tractors, pumps, drones, or any other farm machinery.</p>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="assetName">Asset Name</Label>
                  <Input id="assetName" placeholder="e.g. Primary Tractor" {...register("assetName")} />
                  {errors.assetName && <p className="text-sm text-red-500">{errors.assetName.message}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assetType">Asset Type</Label>
                  <select 
                    id="assetType" 
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                    {...register("assetType")}
                  >
                    <option value="">Select type...</option>
                    <option value="Tractor">Tractor</option>
                    <option value="Harvester">Harvester</option>
                    <option value="Pump">Water Pump</option>
                    <option value="Drone">Agricultural Drone</option>
                    <option value="Sprayer">Sprayer</option>
                    <option value="Other">Other Machinery</option>
                  </select>
                  {errors.assetType && <p className="text-sm text-red-500">{errors.assetType.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand / Make</Label>
                  <Input id="brand" placeholder="e.g. Mahindra, John Deere" {...register("brand")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Input id="model" {...register("model")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseDate">Purchase Date</Label>
                  <Input id="purchaseDate" type="date" {...register("purchaseDate")} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purchaseCost">Purchase Cost (₹)</Label>
                  <Input id="purchaseCost" type="number" {...register("purchaseCost")} />
                </div>
              </div>

              <div className="flex justify-end pt-4 gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isAdding}>
                  {isAdding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                  Save Asset
                </Button>
              </div>
            </form>
          
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-muted/50 rounded-xl border border-dashed">
            <Tractor className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Assets Found</h3>
            <p className="text-muted-foreground">You haven't registered any farm equipment yet.</p>
          </div>
        ) : (
          assets.map((asset: any) => (
            <Card key={asset.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{asset.assetName}</CardTitle>
                    <CardDescription>{asset.assetType} • {asset.brand || 'No brand'}</CardDescription>
                  </div>
                  <Badge variant={asset.currentStatus === 'Active' ? 'default' : 'secondary'}>
                    {asset.currentStatus}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1">
                <div className="grid grid-cols-2 gap-y-2 text-sm">
                  <div className="text-muted-foreground">Model</div>
                  <div className="font-medium text-right">{asset.model || 'N/A'}</div>
                  
                  <div className="text-muted-foreground">Purchased</div>
                  <div className="font-medium text-right">
                    {asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}
                  </div>
                  
                  <div className="text-muted-foreground">Cost</div>
                  <div className="font-medium text-right">
                    {asset.purchaseCost ? `₹${asset.purchaseCost.toLocaleString()}` : 'N/A'}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="pt-3 border-t bg-muted/20 flex justify-between">
                <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/50">
                  <Wrench className="w-4 h-4 mr-2" /> Maintenance
                </Button>
                <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/50" onClick={() => deleteAsset(asset.id)}>
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
