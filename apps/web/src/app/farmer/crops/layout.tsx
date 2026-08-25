"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sprout, LayoutDashboard, History, Calendar, BarChart3, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AIChatWidget } from "@/components/ai/AIChatWidget";

const CROP_LINKS = [
  { label: "Dashboard", href: "/farmer/crops", icon: LayoutDashboard },
  { label: "Calendar", href: "/farmer/crops/calendar", icon: Calendar },
  { label: "History", href: "/farmer/crops/history", icon: History },
  { label: "Analytics", href: "/farmer/crops/analytics", icon: BarChart3 },
];

export default function CropsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sprout className="w-8 h-8 text-emerald-600" />
            Crop Management
          </h1>
          <p className="text-muted-foreground">Digitally manage the lifecycle of your farm crops.</p>
        </div>
        <Link href="/farmer/crops/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Register Crop
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex overflow-x-auto gap-2 hide-scrollbar">
            {CROP_LINKS.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-800 font-medium dark:bg-emerald-900/30 dark:text-emerald-400"
                      : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="pt-2">
        {children}
      </div>

      <AIChatWidget />
    </div>
  );
}
