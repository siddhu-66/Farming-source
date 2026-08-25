"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Store, 
  LayoutDashboard, 
  List, 
  Plus, 
  Inbox, 
  Search, 
  FileText, 
  CreditCard 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const MARKETPLACE_LINKS = [
  { label: "Dashboard", href: "/farmer/marketplace/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/farmer/marketplace/listings", icon: List },
  { label: "Offers", href: "/farmer/marketplace/offers", icon: Inbox },
  { label: "Buyers", href: "/farmer/marketplace/buyers", icon: Search },
  { label: "Contracts", href: "/farmer/marketplace/contracts", icon: FileText },
  { label: "Payments", href: "/farmer/marketplace/payments", icon: CreditCard },
];

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Store className="w-8 h-8 text-emerald-600" />
            Marketplace
          </h1>
          <p className="text-muted-foreground">Sell your crops directly to verified buyers worldwide.</p>
        </div>
        <Link href="/farmer/marketplace/new">
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Create Listing
          </Button>
        </Link>
      </div>

      <Card>
        <CardContent className="p-2">
          <div className="flex overflow-x-auto gap-2 hide-scrollbar">
            {MARKETPLACE_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href === '/farmer/marketplace/dashboard' && pathname === '/farmer/marketplace');
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
    </div>
  );
}
