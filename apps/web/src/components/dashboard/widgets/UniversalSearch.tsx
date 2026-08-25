"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUiStore } from "@/stores/uiStore";
import { useDashboardStore } from "@/stores/useDashboardStore";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/Command";
import { Wheat, User, ShoppingCart, Truck, Factory, Sparkles, FileText, Plus } from "lucide-react";
import { NAVIGATION_MATRIX } from "@/config/navigation";

export function UniversalSearch() {
  const { searchOpen, setSearchOpen } = useUiStore();
  const { profile } = useDashboardStore();
  const router = useRouter();

  // Eventually this will fetch from `/api/v1/search/global?q=${query}`
  // For now, we mock some static results
  const [mockedResults] = useState([
    { id: "c1", category: "Crops", title: "Wheat Crop Listing", icon: Wheat, route: "/farmer/crops" },
    { id: "c2", category: "Crops", title: "Rice Crop Listing", icon: Wheat, route: "/farmer/crops" },
    { id: "f1", category: "People", title: "John Doe (Farmer)", icon: User, route: "/admin/users" },
    { id: "o1", category: "Orders", title: "Order #1024", icon: ShoppingCart, route: "/buyer/orders" },
    { id: "t1", category: "Transport", title: "Vehicle MH-12-AB", icon: Truck, route: "/transport/vehicles" },
    { id: "h1", category: "Help", title: "How to apply for scheme?", icon: Sparkles, route: "/ai" },
  ]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setSearchOpen(!searchOpen);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [searchOpen, setSearchOpen]);

  const handleSelect = (route: string) => {
    setSearchOpen(false);
    router.push(route);
  };

  const role = profile?.role?.toUpperCase() || 'FARMER';
  const navConfig = NAVIGATION_MATRIX[role] || NAVIGATION_MATRIX['FARMER'];

  // Group mocked results by category
  const groupedResults = mockedResults.reduce((acc, result) => {
    if (!acc[result.category]) acc[result.category] = [];
    acc[result.category].push(result);
    return acc;
  }, {} as Record<string, typeof mockedResults>);

  return (
    <CommandDialog open={searchOpen} onOpenChange={setSearchOpen}>
      <CommandInput placeholder="Search crops, farmers, buyers, orders, transport... (Ctrl+K)" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        
        {/* Quick Actions (Command Palette Feature) */}
        {navConfig.quickActions && navConfig.quickActions.length > 0 && (
          <CommandGroup heading="Quick Commands">
            {navConfig.quickActions.map(action => (
              <CommandItem 
                key={`cmd-${action.title}`} 
                onSelect={() => action.onClickRoute && handleSelect(action.onClickRoute)}
                className="cursor-pointer text-green-700 dark:text-green-400"
              >
                <action.icon className="mr-2 h-4 w-4" />
                <span>{action.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Search Results */}
        {Object.entries(groupedResults).map(([category, items]) => (
          <CommandGroup key={category} heading={category}>
            {items.map((item) => {
              const Icon = item.icon;
              return (
                <CommandItem key={item.id} onSelect={() => handleSelect(item.route)} className="cursor-pointer">
                  <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.title}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
