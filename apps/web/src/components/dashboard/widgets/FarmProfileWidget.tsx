"use client";

import { useDashboardStore } from "@/stores/useDashboardStore";
import { motion } from "framer-motion";
import { User, MapPin, CheckCircle, Droplets, Sprout, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";

export function FarmProfileWidget() {
  const { farmProfile } = useDashboardStore();

  if (!farmProfile) return null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-3 border-b border-gray-100 dark:border-gray-800">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Farm Profile</span>
          {farmProfile.verificationStatus === 'Verified' && (
            <Badge variant="success" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/50">
              <ShieldCheck className="w-3 h-3 mr-1" />
              Verified
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center space-x-4">
          <Avatar src={farmProfile.photo || ""} fallback={farmProfile.name?.charAt(0) || "U"} size="lg" className="h-16 w-16 border-2 border-gray-100 dark:border-gray-800" />
          <div>
            <h3 className="font-semibold text-lg">{farmProfile.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1">
              <MapPin className="w-3 h-3 mr-1" />
              ID: {farmProfile.farmId}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center text-muted-foreground mb-1 text-sm">
              <CheckCircle className="w-4 h-4 mr-1 text-blue-500" />
              Total Land
            </div>
            <p className="font-medium">{farmProfile.totalLand}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center text-muted-foreground mb-1 text-sm">
              <Sprout className="w-4 h-4 mr-1 text-green-500" />
              Cultivated
            </div>
            <p className="font-medium">{farmProfile.cultivatedLand}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center text-muted-foreground mb-1 text-sm">
              <Droplets className="w-4 h-4 mr-1 text-blue-400" />
              Soil Type
            </div>
            <p className="font-medium">{farmProfile.soilType}</p>
          </div>
          <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
            <div className="flex items-center text-muted-foreground mb-1 text-sm">
              <Sprout className="w-4 h-4 mr-1 text-green-600" />
              Primary Crop
            </div>
            <p className="font-medium">{farmProfile.primaryCrop}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
