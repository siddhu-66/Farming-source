"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { useCropStore } from "@/stores/useCropStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { Search, Map as MapIcon, Droplets, ArrowRight, BrainCircuit, Activity, AlertTriangle, Calendar as CalendarIcon, CheckCircle2, Sprout } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function CropDashboardPage() {
  const { crops, isLoading, fetchCrops } = useCropStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  const activeCrops = crops.filter(c => c.status !== 'Archived' && c.status !== 'Harvested' && c.status !== 'Sold');
  const healthyCrops = activeCrops.filter(c => c.healthScore >= 75);
  const harvestReadyCrops = activeCrops.filter(c => c.currentStage === 'Ready for Harvest');

  const getHealthColor = (score: number) => {
    if (score >= 90) return "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";
    if (score >= 75) return "text-green-500 bg-green-50 dark:bg-green-500/10";
    if (score >= 50) return "text-yellow-500 bg-yellow-50 dark:bg-yellow-500/10";
    if (score >= 30) return "text-orange-500 bg-orange-50 dark:bg-orange-500/10";
    return "text-red-500 bg-red-50 dark:bg-red-500/10";
  };

  const getHealthText = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 75) return "Good";
    if (score >= 50) return "Moderate";
    if (score >= 30) return "Needs Attention";
    return "Critical";
  };

  const filteredCrops = activeCrops.filter(c => 
    c.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.variety.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-100 dark:bg-emerald-950/20 dark:border-emerald-900">
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{activeCrops.length}</span>
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-500">Active Crops</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-3xl font-bold text-blue-600">{healthyCrops.length}</span>
            <span className="text-sm font-medium text-muted-foreground">Healthy Crops</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-3xl font-bold text-amber-600">{harvestReadyCrops.length}</span>
            <span className="text-sm font-medium text-muted-foreground">Ready for Harvest</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
            <span className="text-3xl font-bold text-purple-600">
              {activeCrops.length > 0 ? Math.round(activeCrops.reduce((a, b) => a + b.healthScore, 0) / activeCrops.length) : 0}%
            </span>
            <span className="text-sm font-medium text-muted-foreground">Avg Health Score</span>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search crops..." 
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCrops.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Sprout className="w-12 h-12 text-muted-foreground mb-4 opacity-20" />
            <h3 className="text-lg font-medium">No crops found</h3>
            <p className="text-muted-foreground mt-1 mb-4">You don't have any active crops matching your criteria.</p>
            <Link href="/farmer/crops/new">
              <Button>Register Your First Crop</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {filteredCrops.map(crop => {
            const daysSinceSowing = differenceInDays(new Date(), new Date(crop.sowingDate));
            const daysToHarvest = differenceInDays(new Date(crop.expectedHarvestDate), new Date());
            const progressPercent = Math.min(100, Math.max(0, (daysSinceSowing / (daysSinceSowing + daysToHarvest)) * 100));

            return (
              <motion.div key={crop.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Card className="h-full flex flex-col hover:border-emerald-500/30 transition-colors group">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-xl flex items-center gap-2">
                          {crop.cropName}
                          {crop.healthScore < 50 && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                        </CardTitle>
                        <CardDescription>{crop.variety} • {crop.season}</CardDescription>
                      </div>
                      <Badge className={getHealthColor(crop.healthScore)}>
                        {getHealthText(crop.healthScore)} ({crop.healthScore}%)
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-4 flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <MapIcon className="w-4 h-4 mr-2 opacity-70" />
                        {crop.parcelName || 'Unassigned Parcel'}
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Activity className="w-4 h-4 mr-2 opacity-70" />
                        {crop.area} Acres
                      </div>
                      <div className="flex items-center text-muted-foreground col-span-2">
                        <Droplets className="w-4 h-4 mr-2 opacity-70 text-blue-500" />
                        {crop.irrigationMethod || 'Rainfed'}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-emerald-700 dark:text-emerald-400">{crop.currentStage}</span>
                        <span className="text-muted-foreground">{daysToHarvest > 0 ? `${daysToHarvest} days to harvest` : 'Ready to Harvest'}</span>
                      </div>
                      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0 border-t mt-auto pt-4 flex gap-2">
                    <Link href={`/farmer/crops/${crop.id}`} className="w-full">
                      <Button variant="outline" className="w-full group-hover:bg-emerald-50 group-hover:text-emerald-700 group-hover:border-emerald-200 dark:group-hover:bg-emerald-500/10">
                        View Details <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
