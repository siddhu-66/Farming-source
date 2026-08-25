"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFarmerProfileStore } from "@/stores/useFarmerProfileStore";
import { User, Phone, MapPin, Tractor, Map as MapIcon, FileText, CheckCircle2, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Progress } from "@/components/ui/Progress";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";

const PROFILE_LINKS = [
  { label: "Personal Info", href: "/farmer/profile/personal", icon: User },
  { label: "Contact Details", href: "/farmer/profile/contact", icon: Phone },
  { label: "Address", href: "/farmer/profile/address", icon: MapPin },
  { label: "Farms", href: "/farmer/profile/farms", icon: Tractor },
  { label: "Land Parcels", href: "/farmer/profile/land", icon: MapIcon },
  { label: "Assets & Machinery", href: "/farmer/profile/assets", icon: Tractor },
  { label: "Workers", href: "/farmer/profile/workers", icon: Users },
  { label: "Documents & KYC", href: "/farmer/profile/documents", icon: FileText },
];

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { profile, isLoading, fetchProfile, fetchFarms, completionPercentage } = useFarmerProfileStore();

  useEffect(() => {
    fetchProfile();
    fetchFarms();
  }, [fetchProfile, fetchFarms]);

  if (isLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-48 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-[400px] md:col-span-3 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6 max-w-6xl">
      {/* Top Banner */}
      <Card className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar 
              className="h-24 w-24 border-4 border-white/20 shadow-xl text-3xl" 
              src={profile?.avatar || ""} 
              fallback={profile?.fullName?.charAt(0) || "F"} 
            />
            
            <div className="flex-1 text-center md:text-left space-y-2">
              <div className="flex items-center justify-center md:justify-start gap-3">
                <h1 className="text-3xl font-bold">{profile?.fullName || "Farmer Profile"}</h1>
                {profile?.verificationStatus === "Verified" && (
                  <Badge className="bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 border-none">
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-emerald-100/80">
                {profile?.phone || "No phone number added"} • {profile?.occupation || "Farmer"}
              </p>
            </div>

            <div className="w-full md:w-64 space-y-2 bg-black/20 p-4 rounded-xl backdrop-blur-sm">
              <div className="flex justify-between text-sm font-medium">
                <span>Profile Completion</span>
                <span>{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-2 bg-black/20 [&>div]:bg-white" />
              {completionPercentage < 100 && (
                <p className="text-xs text-emerald-100/70 text-center mt-2">
                  Complete your profile to unlock all features
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <div className="space-y-2">
          <Card>
            <CardContent className="p-4 flex flex-col gap-1">
              {PROFILE_LINKS.map((link) => {
                const isActive = pathname === link.href || (pathname === "/farmer/profile" && link.href === "/farmer/profile/personal");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 font-medium dark:bg-emerald-500/10 dark:text-emerald-400"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    <link.icon className={`w-5 h-5 ${isActive ? "text-emerald-600 dark:text-emerald-400" : ""}`} />
                    {link.label}
                  </Link>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="md:col-span-3">
          {children}
        </div>
      </div>
    </div>
  );
}
